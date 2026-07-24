import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function testLeaderboard() {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, username, display_name, total_points');
      
    if (usersError) throw usersError;

    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        user_id,
        choice,
        markets (
          status,
          winning_outcome
        )
      `);

    if (votesError) throw votesError;

    const userStats = {};
    users.forEach(u => {
      userStats[u.user_id] = { ...u, correctBets: 0, totalResolved: 0 };
    });

    votes.forEach(v => {
      if (v.markets && v.markets.status === 'Resolved' && userStats[v.user_id]) {
        userStats[v.user_id].totalResolved++;
        if (v.choice === v.markets.winning_outcome) {
          userStats[v.user_id].correctBets++;
        }
      }
    });

    let leaderboard = Object.values(userStats).map(u => {
      const winRate = u.totalResolved > 0 ? Math.round((u.correctBets / u.totalResolved) * 100) : 0;
      return { ...u, winRate };
    });

    leaderboard.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.totalResolved !== a.totalResolved) return b.totalResolved - a.totalResolved;
      return b.total_points - a.total_points;
    });

    console.log(leaderboard.slice(0, 5));
}

testLeaderboard().catch(console.error);
