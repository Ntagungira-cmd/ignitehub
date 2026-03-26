import { UserPlus, Search, Zap } from 'lucide-react';

const steps = [
  {
    title: 'Create Account',
    description: 'Join the IgniteHub community and set up your student or mentor profile in minutes.',
    icon: UserPlus,
  },
  {
    title: 'Explore & Connect',
    description: 'Browse through a curated list of mentors and innovative projects matching your interests.',
    icon: Search,
  },
  {
    title: 'Ignite Collaboration',
    description: 'Start working together, share resources, and bring your ideas to life.',
    icon: Zap,
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-brand-600 font-bold tracking-widest uppercase text-sm">Process</h2>
          <h3 className="text-4xl font-black text-slate-900">How It Works</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-between relative mt-12">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-0 transform -translate-y-[100px]" />
          
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex flex-col items-center text-center relative z-10 px-4">
               <div className="w-20 h-20 bg-white border-4 border-slate-50 flex items-center justify-center rounded-full shadow-xl shadow-slate-200/50 mb-8 group hover:scale-110 transition-transform">
                <step.icon className="w-8 h-8 text-brand-500" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h4>
              <p className="text-slate-500 leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
