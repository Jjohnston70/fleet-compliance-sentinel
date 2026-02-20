import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-darker-blue/95 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Image src="/True-North-Logo-Layered-v3.svg" alt="True North Data Strategies" width={64} height={64} className="h-16 w-auto mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed">
              We build simple systems that help small businesses run smoother.<br />
              Veteran-owned. Based in Colorado Springs.
            </p>
            <div className="flex gap-3 mt-4">
              <Image src="/Veteran-Owned Certified.png" alt="VOSB Certified" width={64} height={64} className="h-12 w-auto" />
              <Image src="/Service-Disabled Veteran-Owned-Certified.png" alt="SDVOSB Certified" width={64} height={64} className="h-12 w-auto" />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-tn-teal font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', href: '/' },
                { name: 'PipelineX', href: '/pipelinex' },
                { name: 'How It Works', href: '/how-it-works' },
                { name: 'FAQ', href: '/faq' },
                { name: 'About Jacob', href: '/about' },
                { name: 'Contact', href: '/contact' },
                { name: 'Legal', href: '/legal' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 text-sm hover:text-tn-teal transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-tn-teal font-semibold mb-4 text-sm uppercase tracking-wider">Get In Touch</h3>
            <div className="space-y-3">
              <a href="tel:555-555-5555" className="flex items-center gap-2 text-gray-400 text-sm hover:text-tn-teal transition-colors">
                <span>📞</span> (555) 555-5555
              </a>
              <a href="mailto:jacob@truenorthstrategyops.com" className="flex items-center gap-2 text-gray-400 text-sm hover:text-tn-teal transition-colors">
                <span>✉️</span> jacob@truenorthstrategyops.com
              </a>
              <p className="flex items-center gap-2 text-gray-400 text-sm">
                <span>📍</span> Colorado Springs, CO — Serving nationwide
              </p>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-xs">UEI: WKJXXACV8U43</p>
              <p className="text-gray-500 text-xs">VOSB &amp; SDVOSB Certified</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} True North Data Strategies LLC. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/legal#privacy" className="text-gray-500 text-xs hover:text-tn-teal transition-colors">Privacy Policy</Link>
            <Link href="/legal#terms" className="text-gray-500 text-xs hover:text-tn-teal transition-colors">Terms</Link>
            <Link href="/legal#accessibility" className="text-gray-500 text-xs hover:text-tn-teal transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
