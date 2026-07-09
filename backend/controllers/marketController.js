import { supabase } from "../utils/supabase.js";

export const vote = async (req, res) => {
  try {
    const { user_id, market_id, choice } = req.body;

    if (!user_id || !market_id || !choice || !["YES", "NO"].includes(choice.toUpperCase())) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const { data: market, error: marketError } = await supabase
      .from("markets")
      .select("house_yes_points, house_no_points, status")
      .eq("market_id", market_id)
      .single();

    if (marketError) throw marketError;
    if (!market) return res.status(404).json({ success: false, message: "Market not found" });
    if (market.status !== "Active") {
      return res.status(400).json({ success: false, message: "This market is no longer accepting votes" });
    }

    const { data: existingVote } = await supabase
      .from("votes")
      .select("vote_id, choice")
      .eq("user_id", user_id)
      .eq("market_id", market_id)
      .maybeSingle();

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: `You already voted ${existingVote.choice} on this market`,
        existing_choice: existingVote.choice
      });
    }

    const updates = {};
    if (choice.toUpperCase() === "YES") {
      updates.house_yes_points = market.house_yes_points + 1;
    } else {
      updates.house_no_points = market.house_no_points + 1;
    }

    const { error: marketUpdateError } = await supabase
      .from("markets")
      .update(updates)
      .eq("market_id", market_id);

    if (marketUpdateError) throw marketUpdateError;

    const dbChoice = choice.toUpperCase() === "YES" ? "Yes" : "No";

    const { error: voteError } = await supabase
      .from("votes")
      .insert([{ user_id, market_id, choice: dbChoice, amount: 1 }]);

    if (voteError) throw voteError;

    return res.json({ success: true, message: "Vote recorded!", choice: dbChoice });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityFeed = async (req, res) => {
  try {
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("vote_id, choice, created_at, users ( username, display_name ), markets ( market_id, question )")
      .order("created_at", { ascending: false })
      .limit(10);

    if (votesError) throw votesError;

    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("comment_id, content, created_at, users ( username, display_name ), markets ( market_id, question )")
      .order("created_at", { ascending: false })
      .limit(10);

    if (commentsError) throw commentsError;

    const formattedVotes = votes.map(v => ({
      type: "vote",
      id: `vote_${v.vote_id}`,
      user: v.users,
      market: v.markets,
      choice: v.choice,
      created_at: v.created_at
    }));

    const formattedComments = comments.map(c => ({
      type: "comment",
      id: `comment_${c.comment_id}`,
      user: c.users,
      market: c.markets,
      content: c.content,
      created_at: c.created_at
    }));

    const combined = [...formattedVotes, ...formattedComments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 15);

    return res.json({ success: true, activities: combined });
  } catch (error) {
    console.error("Activity Feed Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveMarket = async (req, res) => {
  try {
    const { market_id, winning_outcome } = req.body;

    if (!market_id || !winning_outcome || !["YES", "NO", "CANCEL"].includes(winning_outcome)) {
      return res.status(400).json({ success: false, message: "Invalid parameters" });
    }

    const { data: market, error: marketError } = await supabase
      .from("markets")
      .select("*")
      .eq("market_id", market_id)
      .single();

    if (marketError || !market) return res.status(404).json({ success: false, message: "Market not found" });
    if (market.status === "Resolved") return res.status(400).json({ success: false, message: "Market is already resolved" });

    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("*")
      .eq("market_id", market_id);

    if (votesError) throw votesError;

    const notificationsToInsert = [];
    const votesToUpdate = [];

    for (const vote of votes) {
      let isWinner = null;
      if (winning_outcome !== "CANCEL") {
        isWinner = vote.choice.toUpperCase() === winning_outcome;
      }

      if (winning_outcome !== "CANCEL") {
        notificationsToInsert.push({
          user_id: vote.user_id,
          title: isWinner ? "Correct Prediction! ✅" : "Incorrect Prediction ❌",
          message: isWinner
            ? `You predicted correctly on "${market.question}"! Great job!`
            : `You predicted incorrectly on "${market.question}". Better luck next time!`
        });
      }

      votesToUpdate.push({
        vote_id: vote.vote_id,
        isWinner,
        market_id: market.market_id,
        user_id: vote.user_id,
        amount: vote.amount,
        choice: vote.choice
      });
    }

    if (notificationsToInsert.length > 0) {
      await supabase.from("notifications").insert(notificationsToInsert);
    }
    if (votesToUpdate.length > 0) {
      await supabase.from("votes").upsert(votesToUpdate);
    }

    const { error: updateError } = await supabase
      .from("markets")
      .update({
        status: "Resolved",
        winning_outcome: winning_outcome === "CANCEL" ? null : (winning_outcome === "YES" ? "Yes" : "No")
      })
      .eq("market_id", market_id);

    if (updateError) throw updateError;

    return res.json({ success: true, message: `Market resolved as ${winning_outcome}.` });

  } catch (error) {
    console.error("Resolve Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createMarket = async (req, res) => {
  try {
    const { question, category, image_url, end_date } = req.body;

    if (!question || !category) {
      return res.status(400).json({ success: false, message: "Question and Category are required" });
    }

    const { data: newMarket, error } = await supabase
      .from("markets")
      .insert([{
        question,
        category,
        image_url: image_url || null,
        end_date: end_date || null,
        house_yes_points: 0,
        house_no_points: 0,
        status: "Active"
      }])
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, message: "Market created successfully", market: newMarket });
  } catch (error) {
    console.error("Create Market Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
