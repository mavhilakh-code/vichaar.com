import React from 'react';
import { Target, Lightbulb, Users, Trophy } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#0f1115] min-h-screen text-slate-300 pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#00c853]/10 to-[#0f1115] border-b border-[#2a2e33] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About <span className="text-[#00c853]">Vichaar</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium mb-8">
            India's Public Opinion & Prediction Platform
          </p>
          <div className="inline-block bg-[#00c853]/20 border border-[#00c853]/50 text-[#00c853] px-6 py-3 rounded-full text-sm font-bold tracking-wide">
            Know what India thinks. Predict what happens next. No real money. Just real opinions.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-16 space-y-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Intro */}
        <section className="text-lg leading-relaxed">
          <p className="mb-6">
            <strong className="text-white">Vichaar</strong> is a platform where people across India can express their opinions and predict the outcomes of real-world events. From politics and the economy to sports, entertainment, technology, and e-commerce, Vichaar provides an engaging way to explore public sentiment and collective predictions.
          </p>
          <p className="mb-6">
            Vichaar is designed for learning, discussion, and friendly competition. <strong className="text-red-400">It does not involve real-money betting or gambling.</strong> Users participate using virtual points to make predictions, compare their insights with others, and climb the leaderboard based on accuracy.
          </p>
          <p>
            Our mission is to make public opinion more visible and encourage informed discussions by bringing together diverse perspectives on the topics that matter most.
          </p>
        </section>

        {/* What You Can Do */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-[#2a2e33] pb-4">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111317] border border-[#2a2e33] p-6 rounded-2xl flex items-start gap-4 hover:border-[#00c853]/50 transition-colors">
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400 shrink-0">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Share & Explore</h3>
                <p className="text-sm text-slate-400">Share your opinion on current events and explore public sentiment across different topics.</p>
              </div>
            </div>
            
            <div className="bg-[#111317] border border-[#2a2e33] p-6 rounded-2xl flex items-start gap-4 hover:border-[#00c853]/50 transition-colors">
              <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 text-purple-400 shrink-0">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Predict Outcomes</h3>
                <p className="text-sm text-slate-400">Predict outcomes using virtual points across politics, sports, business, entertainment, and technology.</p>
              </div>
            </div>

            <div className="bg-[#111317] border border-[#2a2e33] p-6 rounded-2xl flex items-start gap-4 hover:border-[#00c853]/50 transition-colors md:col-span-2">
              <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 text-yellow-500 shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Earn Rankings</h3>
                <p className="text-sm text-slate-400">Earn rankings and achievements based on accurate predictions and climb to the top of the leaderboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Vichaar? */}
        <section className="bg-[#111317] border border-[#2a2e33] p-8 md:p-12 rounded-3xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Users className="text-[#00c853]" size={32} />
            Why Vichaar?
          </h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center gap-3">
              <span className="text-[#00c853]">✔</span>
              <span><strong>No real money involved</strong> — purely for fun, learning, and community engagement.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#00c853]">✔</span>
              <span>Simple and easy-to-use interface.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#00c853]">✔</span>
              <span>Transparent prediction system.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#00c853]">✔</span>
              <span>Community-driven insights.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#00c853]">✔</span>
              <span>A wide range of topics relevant to India.</span>
            </li>
          </ul>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-lg leading-relaxed bg-[#00c853]/5 border-l-4 border-[#00c853] p-6 rounded-r-2xl">
            To build India's most trusted platform for public opinion and prediction, helping people understand trends, exchange ideas, and improve their forecasting skills in a safe and enjoyable environment.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="text-sm text-slate-500 bg-[#16181d] p-6 rounded-2xl border border-[#2a2e33]">
          <h3 className="font-bold text-slate-400 mb-2 uppercase tracking-wider">Disclaimer</h3>
          <p>
            Vichaar is an entertainment and educational platform. All predictions are made using virtual points only. The platform does not facilitate real-money betting, gambling, or financial trading. Content and predictions reflect community participation and should not be considered financial, political, or investment advice.
          </p>
        </section>

      </div>
    </div>
  );
}
