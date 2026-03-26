import { Users, Rocket, FileText, ChevronRight } from 'lucide-react';

const features = [
  {
    title: 'Expert Mentorship',
    description: 'Connect with industry professionals and senior students who can guide your journey and ignite your passion.',
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Project Collaboration',
    description: 'Find exciting projects to join or post your own ideas to build a dream team and create something amazing.',
    icon: Rocket,
    color: 'bg-brand-500',
    lightColor: 'bg-brand-50',
    iconColor: 'text-brand-600',
  },
  {
    title: 'Resource Library',
    description: 'Access a curated collection of learning materials, templates, and tools shared by the community.',
    icon: FileText,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-brand-600 font-bold tracking-widest uppercase text-sm">Features</h2>
          <h3 className="text-4xl lg:text-5xl font-black text-slate-900">
            Everything you need to <br className="hidden md:block" /> succeed in your projects
          </h3>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            IgniteHub provides the infrastructure and community support for students to bridge the gap between theory and practice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group glass-card p-8 rounded-[2rem] hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`w-14 h-14 ${feature.lightColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              <button className="flex items-center gap-2 text-brand-600 font-bold group/btn">
                Learn More 
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
