import { supabase } from "../utils/supabase.js";
import bcrypt from "bcryptjs";

// Daily bonus removed — app now uses a voting-based system with no points.

export const getPortfolio = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ success: false, message: "Missing user_id" });

    // Fetch all votes with market data
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        vote_id,
        choice,
        created_at,
        markets (
          market_id,
          question,
          status,
          winning_outcome
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (votesError) throw votesError;

    const myVotes = votes.map(v => {
      const isResolved = v.markets.status === 'Resolved';
      const isWinner = isResolved && v.markets.winning_outcome !== null && v.markets.winning_outcome === v.choice;
      
      return {
        id: v.vote_id,
        market_id: v.markets.market_id,
        question: v.markets.question,
        choice: v.choice,
        status: v.markets.status,
        winning_outcome: v.markets.winning_outcome,
        isWinner: isWinner,
        created_at: v.created_at
      };
    });

    return res.json({ success: true, votes: myVotes });
  } catch (error) {
    console.error("Portfolio Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, username, display_name');

    if (usersError) throw usersError;

    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('user_id, choice, markets ( status, winning_outcome )');

    if (votesError) throw votesError;

    const userStats = {};
    users.forEach(u => {
      userStats[u.user_id] = { ...u, correctBets: 0, totalResolved: 0 };
    });

    votes.forEach(v => {
      if (v.markets && v.markets.status === 'Resolved' && userStats[v.user_id]) {
        if (v.markets.winning_outcome !== null) {
          userStats[v.user_id].totalResolved++;
          if (v.choice === v.markets.winning_outcome) {
            userStats[v.user_id].correctBets++;
          }
        }
      }
    });

    let leaderboard = Object.values(userStats).map(u => {
      const winRate = u.totalResolved > 0 ? Math.round((u.correctBets / u.totalResolved) * 100) : 0;
      return { ...u, winRate };
    });

    leaderboard.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.totalResolved - a.totalResolved;
    });

    return res.json({ success: true, leaderboard: leaderboard.slice(0, 20) });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, username, display_name')
      .eq('username', username)
      .single();

    if (userError || !user) throw userError || new Error("User not found");

    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        vote_id,
        choice,
        created_at,
        markets (
          market_id,
          question,
          status,
          winning_outcome
        )
      `)
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false });

    if (votesError) throw votesError;

    let correctBets = 0;
    let totalResolved = 0;

    const history = votes.map(v => {
      const isResolved = v.markets.status === 'Resolved';
      const isWinner = isResolved && v.markets.winning_outcome === v.choice;

      if (isResolved && v.markets.winning_outcome !== null) {
        totalResolved++;
        if (isWinner) correctBets++;
      }

      return {
        id: v.vote_id,
        market_id: v.markets.market_id,
        question: v.markets.question,
        choice: v.choice,
        status: v.markets.status,
        winning_outcome: v.markets.winning_outcome,
        isWinner,
        created_at: v.created_at
      };
    });

    const winRate = totalResolved > 0 ? Math.round((correctBets / totalResolved) * 100) : 0;

    return res.json({
      success: true,
      profile: {
        username: user.username,
        display_name: user.display_name,
        winRate,
        totalVotes: votes.length,
        totalResolved,
        history
      }
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: "User ID required" });

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    
    return res.json({ success: true, notifications: data });
  } catch (error) {
    console.error("Notifications Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ success: false, message: "User ID required" });

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user_id)
      .eq('is_read', false);

    if (error) throw error;
    
    return res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Notifications Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { user_id, display_name } = req.body;
    
    if (!user_id || !display_name) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ display_name })
      .eq('user_id', user_id)
      .select('user_id, username, display_name')
      .single();

    if (error) throw error;

    return res.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { user_id, email } = req.body;
    
    if (!user_id || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ email })
      .eq('user_id', user_id)
      .select('user_id, username, display_name, email')
      .single();

    if (error) {
      // If column doesn't exist, this will throw
      if (error.code === '42703') {
         return res.status(500).json({ success: false, message: "Database Error: The 'email' column does not exist in the users table." });
      }
      throw error;
    }

    return res.json({ 
      success: true, 
      message: "Email updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Email Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { user_id, old_password, new_password } = req.body;

    if (!user_id || !old_password || !new_password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch user's current password hash
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('user_id', user_id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify old password
    const passwordMatches = await bcrypt.compare(old_password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Incorrect old password" });
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // Update in DB
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: new_password_hash })
      .eq('user_id', user_id);

    if (updateError) throw updateError;

    return res.json({ 
      success: true, 
      message: "Password changed successfully!"
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
