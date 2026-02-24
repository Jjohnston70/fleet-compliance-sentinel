import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Jacob Johnston — True North Data Strategies',
  description:
    '20-year Army veteran, Bronze Star recipient, self-taught developer. Jacob Johnston built True North Data Strategies to help small businesses stop drowning in spreadsheets.',
};

export default function AboutPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex gap-2 mb-4">
              <Image src="/Veteran-Owned Certified.png" alt="VOSB Certified" width={60} height={60} className="h-14 w-auto" />
              <Image src="/Service-Disabled Veteran-Owned-Certified.png" alt="SDVOSB Certified" width={60} height={60} className="h-14 w-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              From Combat Deployments to Code Deployments
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <Image
                src="/headshot.png"
                alt="Jacob Johnston"
                width={200}
                height={200}
                className="rounded-full border-2 border-tn-teal/30 w-48 h-48 object-cover"
              />
              <div className="text-center mt-3">
                <p className="text-white font-semibold">Jacob Johnston</p>
                <p className="text-tn-teal text-sm">Founder, True North Data Strategies</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-gray-300 text-lg">
                20 years in the Army — Airborne Infantry, multiple combat deployments, Bronze Star.
                The military taught me that complex problems require systematic solutions, not just throwing
                technology at them.
              </p>
              <p className="text-gray-300">
                After I got out, I spent two years building operational systems at a fuel distribution company.
                Pricing dashboards, inventory tracking, compliance automation, daily reporting tools.
                I saw firsthand how businesses waste thousands of hours on manual work that could be automated in minutes.
              </p>
              <p className="text-gray-300">
                I started with Google Apps Script because it worked with tools businesses already used.
                That turned into 50+ systems now running in real businesses.
              </p>
              <p className="text-gray-300">
                I founded True North Data Strategies because every business owner deserves to see what&apos;s
                happening in their operation — and to be able to take a day off.
              </p>
              <blockquote className="border-l-4 border-tn-teal pl-4 text-tn-teal italic">
                &ldquo;I was tired of watching businesses drown in spreadsheets.
                Now I build simple systems that help owners take a day off.&rdquo;
              </blockquote>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🪖', title: 'Military Veteran', desc: '20 years Airborne Infantry. Combat deployments. Bronze Star. Discipline and systems thinking — applied to your business.' },
              { icon: '💻', title: 'Practical Systems Builder', desc: 'Built systems to solve real business problems. Practical execution over buzzwords.' },
              { icon: '🏗️', title: '50+ Systems Deployed', desc: 'Not demos. Not prototypes. Real systems running real businesses every day.' },
            ].map((v) => (
              <div key={v.title} className="card text-center">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="text-tn-teal font-semibold mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="card mb-12">
            <h2 className="text-2xl font-heading font-bold text-white mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Real results over shiny gimmicks', desc: 'We build solutions that solve actual problems. No buzzword bingo.' },
                { title: 'Transparent pricing', desc: 'No hidden fees. No surprise charges. You know exactly what you\'re paying for.' },
                { title: 'Plain English, not tech jargon', desc: 'If you can\'t understand it, we haven\'t explained it right.' },
                { title: 'Build things that last', desc: 'You own what we build. Your team can maintain it without calling us.' },
              ].map((v) => (
                <div key={v.title} className="flex items-start gap-3">
                  <span className="text-tn-teal mt-0.5">✓</span>
                  <div>
                    <p className="text-white font-medium text-sm">{v.title}</p>
                    <p className="text-gray-400 text-xs">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-4">Based in Colorado Springs. Serving small businesses nationwide.</p>
            <p className="text-gray-400 text-sm mb-6">SBA-Certified VOSB &amp; SDVOSB &nbsp;·&nbsp; UEI: WKJXXACV8U43</p>
            <a href="tel:555-555-5555" className="btn-primary text-lg px-8">
              Call Jacob: (555) 555-5555
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
