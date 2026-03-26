import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 space-y-6">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold italic">I</span>
            </div>
            <span className="text-white font-bold text-xl">IgniteHub</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            A secure ecosystem for academic collaboration and professional mentorship.
          </p>
        </div>

        <div className="space-y-6">
          <h5 className="text-white font-bold">Platform</h5>
          <ul className="space-y-4 text-sm">
            <li><Link href="#features" className="hover:text-brand-400 transition-colors">Features</Link></li>
            <li><Link href="#how-it-works" className="hover:text-brand-400 transition-colors">How it Works</Link></li>
            <li><Link href="/projects" className="hover:text-brand-400 transition-colors">Browse Projects</Link></li>
            <li><Link href="/mentors" className="hover:text-brand-400 transition-colors">Find Mentors</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className="text-white font-bold">Company</h5>
          <ul className="space-y-4 text-sm">
            <li><Link href="#" className="hover:text-brand-400 transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-brand-400 transition-colors">Contact</Link></li>
            <li><Link href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h5 className="text-white font-bold">Newsletter</h5>
          <p className="text-sm text-slate-400">Get the latest project updates and resources once a week.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-600 transition-all">
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} IgniteHub. All rights reserved. Built with &hearts; for students.
      </div>
    </footer>
  );
};
