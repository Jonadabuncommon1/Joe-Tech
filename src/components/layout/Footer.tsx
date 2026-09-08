import React from 'react';
import { Laptop, Smartphone, Cpu, Sun, Battery, Monitor, Tablet, Wifi, HardDrive, Zap } from 'lucide-react';
import { FaApple, FaAndroid, FaWindows, FaLinux, FaGamepad, FaSolarPanel } from 'react-icons/fa';
import { MdSolarPower, MdCable } from 'react-icons/md';
import { useAppContext } from '../../store/AppContext';
import { marketplaceCategories } from '../../data';
import { contacts, site } from '../../config/site';
import { LogoLockup } from '../brand/Logo';
const supportMessage = `Hello 👋
Welcome to Joe Tech Customer Support.

Thank you for reaching out to us. Our support team is available to assist you with:
• General enquiries
• Product information
• Order support
• Delivery assistance
• Complaints or feedback
• Business enquiries

Kindly send us a message describing how we may assist you, and a representative will respond as soon as possible.

We appreciate your patience and thank you for choosing Joe Tech.

Precision, Quality, and Reliability at Its Finest.`;

// A single light band of decorative icons rather than five, less visual
// weight and less DOM for the same "techy background" effect.
const bgIcons = [
  { Icon: Laptop,       top: '15%', left: '5%',   size: 130, rotate: '-15deg' },
  { Icon: FaWindows,    top: '70%', left: '14%',  size: 110, rotate: '10deg'  },
  { Icon: Sun,          top: '20%', left: '26%',  size: 150, rotate: '0deg'   },
  { Icon: FaApple,      top: '65%', left: '38%',  size: 120, rotate: '-8deg'  },
  { Icon: Smartphone,   top: '15%', left: '48%',  size: 140, rotate: '12deg'  },
  { Icon: FaGamepad,    top: '70%', left: '58%',  size: 160, rotate: '-12deg' },
  { Icon: MdSolarPower, top: '18%', left: '70%',  size: 140, rotate: '-30deg' },
  { Icon: FaAndroid,    top: '68%', left: '80%',  size: 130, rotate: '8deg'   },
  { Icon: HardDrive,    top: '15%', left: '90%',  size: 110, rotate: '-18deg' },
];

const BackgroundIcons = () => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.05] dark:opacity-[0.06]">
    {bgIcons.map((item, index) => {
      const { Icon, top, left, size, rotate } = item;
      return (
        <div
          key={index}
          className="absolute text-jt-blue dark:text-jt-mint"
          style={{ top, left, transform: `translate(-50%, -50%) rotate(${rotate})` }}
        >
          <Icon size={size} />
        </div>
      );
    })}
  </div>
);

export const Footer = () => {
  const { setCurrentView, setActiveCategory, user } = useAppContext();

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentView('category');
    window.scrollTo(0, 0);
  };

  const handleServicesClick = () => {
    setCurrentView('services');
    window.scrollTo(0, 0);
  };

  return (
    <footer
      className="relative overflow-hidden border-t border-jt-ink/8 bg-white pb-6 pt-12 text-jt-ink transition-colors dark:border-white/10 dark:bg-jt-ink dark:text-white"
      style={{ fontFamily: 'var(--font-footer)' }}
    >
      <BackgroundIcons />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Logo/description spans the full row on every width; Categories and
            Support always sit side by side as their own two columns,
            including on a phone, matching the desktop arrangement rather
            than stacking three-deep on a narrow screen. */}
        <div className="mb-10 grid grid-cols-2 gap-y-10 gap-x-6 sm:gap-x-8 md:grid-cols-3 md:gap-y-8 lg:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center">
              <LogoLockup className="h-20 md:h-24" />
            </div>
            <p className="mb-4 text-sm leading-relaxed text-jt-ink/70 dark:text-jt-steel">
              Phones, laptops, gaming gear and solar power, sourced, tested and backed by real people
              in Nsukka and Ikeja, Lagos.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-xs font-bold uppercase tracking-widest text-jt-blue dark:text-jt-mint">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              {marketplaceCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() =>
                      cat.isService ? handleServicesClick() : handleCategoryClick(cat.id)
                    }
                    className="w-full cursor-pointer text-left text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-jt-steel dark:hover:text-jt-mint"
                  >
                    {cat.shortName}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-sans text-xs font-bold uppercase tracking-widest text-jt-blue dark:text-jt-mint">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href={`https://wa.me/2348133727813?text=${encodeURIComponent(supportMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-jt-steel dark:hover:text-jt-mint"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@joetech.shop"
                  className="cursor-pointer text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-jt-steel dark:hover:text-jt-mint"
                >
                  Email Support
                </a>
              </li>
              <li>
                <button
                  onClick={handleServicesClick}
                  className="w-full cursor-pointer text-left text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-jt-steel dark:hover:text-jt-mint"
                >
                  Book a Repair
                </button>
              </li>
              <li>
                <a
                  href={`tel:${contacts.primary}`}
                  className="cursor-pointer text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-jt-steel dark:hover:text-jt-mint"
                >
                  {contacts.primary}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contacts.secondary}`}
                  className="cursor-pointer text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-jt-steel dark:hover:text-jt-mint"
                >
                  {contacts.secondary}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* The branch address block that used to sit here was a condensed
            repeat of the full "Two branches, real people" section already on
            the homepage above the footer, removed as redundant clutter. */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-jt-ink/8 pt-5 text-xs font-medium text-jt-ink/60 dark:border-white/10 dark:text-jt-steel md:flex-row">
          <p>&copy; {new Date().getFullYear()} Joe Tech. All rights reserved. · {site.email}</p>
          <div className="flex space-x-6">
            <button
              onClick={() => { setCurrentView('privacy'); window.scrollTo(0, 0); }}
              className="transition-colors hover:text-jt-blue dark:hover:text-jt-mint"
            >
              Privacy
            </button>
            <button
              onClick={() => { setCurrentView('terms'); window.scrollTo(0, 0); }}
              className="transition-colors hover:text-jt-blue dark:hover:text-jt-mint"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
