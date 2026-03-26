import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Empowering the Next Generation</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Ignite Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">Potential</span> with IgniteHub
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
            The all-in-one platform for students to find mentors, collaborate on world-changing projects, and share knowledge that matters.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/register" 
              className="group px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:shadow-2xl hover:shadow-brand-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Start Collaborating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95"
            >
              Explore Features
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                   U{i}
                </div>
              ))}
            </div>
            <p><span className="font-bold text-slate-900">500+</span> Students already joined</p>
          </div>
        </div>

        <div className="relative lg:ml-auto">
          <div className="relative z-10 w-full aspect-square max-w-[500px] mx-auto lg:max-w-none group">
            <div className="absolute inset-0 bg-brand-500/10 rounded-3xl blur-2xl group-hover:bg-brand-500/20 transition-all -z-10" />
            <div className="glass-card p-4 rounded-[2.5rem] overflow-hidden">
               <Image 
                src="/images/hero_illustration.png" 
                alt="IgniteHub Illustration" 
                width={800} 
                height={800}
                className="w-full h-full object-cover rounded-3xl"
                priority
              />
            </div>
          </div>
          
          {/* Floating glass elements */}
          <div className="absolute -top-6 -right-6 glass-card p-4 rounded-2xl shadow-xl animate-float hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Live Mentors</p>
                <p className="text-sm font-black text-slate-900">12 Active Now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
