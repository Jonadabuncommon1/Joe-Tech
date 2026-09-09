/**
 * Stills for the hero slideshow, served straight out of /public/hero.
 *
 * Every shot carries the shop category it belongs to, because the hero shows
 * two at a time and deliberately pairs shots from two different categories, so
 * a visitor always sees two sides of the business at once rather than two
 * near-identical phone photos.
 *
 * The order below is just how the list reads, never the running order — the
 * hero deals itself a freshly shuffled deck each lap (see HeroVisual), works
 * through every shot once, then reshuffles into a different order.
 */
export type HeroCategory =
  | 'iphones-ipads'
  | 'android-phones'
  | 'laptops-tablets'
  | 'phone-accessories'
  | 'laptop-accessories'
  | 'gaming-setup'
  | 'solar-power';

export interface HeroShot {
  src: string;
  alt: string;
  category: HeroCategory;
}

export const heroShots: HeroShot[] = [
  // ── iPhones & iPads ──
  { src: '/hero/iphone-16-series.jpg', alt: 'The iPhone 16 series', category: 'iphones-ipads' },
  { src: '/hero/ipad-blue-boxed.jpg', alt: 'A blue iPad resting on its box', category: 'iphones-ipads' },
  { src: '/hero/ipad-10-9.jpg', alt: 'iPad 10.9 inch', category: 'iphones-ipads' },
  { src: '/hero/iphone-11-stock.jpg', alt: 'A spread of unlocked iPhone 11 units in every colour', category: 'iphones-ipads' },
  { src: '/hero/iphone-12-stock.jpg', alt: 'A batch of unlocked iPhone 12 units in every colour', category: 'iphones-ipads' },
  { src: '/hero/iphone-13-stock.jpg', alt: 'iPhone 13 units in pink, red, starlight and midnight', category: 'iphones-ipads' },
  { src: '/hero/iphone-13-pro-stock.jpg', alt: 'iPhone 13 Pro units in alpine green, graphite, sierra blue and gold', category: 'iphones-ipads' },
  { src: '/hero/iphone-15-pro-stock.jpg', alt: 'iPhone 15 Pro units, battery and Face ID tested', category: 'iphones-ipads' },
  { src: '/hero/iphone-17-pro-stock.jpg', alt: 'iPhone 17 Pro units in silver, deep blue and orange', category: 'iphones-ipads' },
  { src: '/hero/iphone-xr-stock.jpg', alt: 'A batch of unlocked iPhone XR units in every colour', category: 'iphones-ipads' },
  { src: '/hero/phone-shelves.jpg', alt: 'Shelves of tested iPhones ready for sale', category: 'iphones-ipads' },
  { src: '/hero/sealed-phone-boxes.jpg', alt: 'A stack of sealed iPhone and Samsung boxes', category: 'iphones-ipads' },

  // ── Android phones ──
  { src: '/hero/samsung-galaxy-s24-ultra.jpg', alt: 'Samsung Galaxy S24 Ultra in titanium black', category: 'android-phones' },
  { src: '/hero/samsung-galaxy-s26-ultra.jpg', alt: 'Samsung Galaxy S26 Ultra', category: 'android-phones' },
  { src: '/hero/samsung-galaxy-s10.jpg', alt: 'Samsung Galaxy S10, front and back', category: 'android-phones' },
  { src: '/hero/google-pixel-10a.jpg', alt: 'Google Pixel 10a in obsidian', category: 'android-phones' },
  { src: '/hero/google-pixel-10-pro-xl.jpg', alt: 'Google Pixel 10 Pro XL', category: 'android-phones' },
  { src: '/hero/android-tablet.jpg', alt: 'An Android tablet, front and back', category: 'android-phones' },
  { src: '/hero/google-pixel-stock.jpg', alt: 'A batch of Google Pixel phones, Pixel 7 through Pixel 10', category: 'android-phones' },
  { src: '/hero/google-pixel-colours.jpg', alt: 'Google Pixel phones fanned out in every colour', category: 'android-phones' },
  { src: '/hero/galaxy-ultra-vs-iphone-pro.jpg', alt: 'A Samsung Galaxy Ultra standing next to an iPhone Pro', category: 'android-phones' },
  { src: '/hero/itel-it2160-phones.jpg', alt: 'Boxes of itel it2160 feature phones with wireless FM', category: 'android-phones' },
  { src: '/hero/itel-it5627-metal-phones.jpg', alt: 'itel it5627 Metal feature phones with 70 day standby', category: 'android-phones' },
  { src: '/hero/tecno-t302-phones.jpg', alt: 'Tecno T302 feature phones in their boxes', category: 'android-phones' },
  { src: '/hero/redmi-a7-and-17.jpg', alt: 'Redmi A7 and Redmi 17 phones stacked above itel power stations', category: 'android-phones' },
  { src: '/hero/redmi-17-stock.jpg', alt: 'Redmi 17 phones stacked on itel Power Go Pro units', category: 'android-phones' },
  { src: '/hero/infinix-note-50-pro.jpg', alt: 'Infinix Note 50 Pro in purple', category: 'android-phones' },
  { src: '/hero/infinix-note-60-pro.jpg', alt: 'Infinix Note 60 Pro in orange', category: 'android-phones' },
  { src: '/hero/infinix-note-edge.jpg', alt: 'Infinix Note Edge 5G', category: 'android-phones' },

  // ── Laptops & tablets ──
  { src: '/hero/macbook-air-and-pro.jpg', alt: 'MacBook Air and MacBook Pro', category: 'laptops-tablets' },
  { src: '/hero/macbook-pro-touchbar.jpg', alt: 'MacBook Pro with Touch Bar', category: 'laptops-tablets' },
  { src: '/hero/macbook-pro-retina-i5.jpg', alt: 'MacBook Pro with Intel Core i5 and a Retina display', category: 'laptops-tablets' },
  { src: '/hero/windows-11-laptop.jpg', alt: 'A slim laptop running Windows 11', category: 'laptops-tablets' },
  { src: '/hero/surface-laptop.jpg', alt: 'A clean UK used laptop with its charger', category: 'laptops-tablets' },
  { src: '/hero/laptops-7th-gen.jpg', alt: 'Brand new 7th generation laptops', category: 'laptops-tablets' },
  { src: '/hero/gaming-laptop-4k.jpg', alt: 'A gaming laptop running 4K graphics', category: 'laptops-tablets' },
  { src: '/hero/asus-rog-gaming-laptop.jpg', alt: 'An ASUS ROG gaming laptop lit in neon', category: 'laptops-tablets' },
  { src: '/hero/surface-laptop-studio.jpg', alt: 'A Surface Laptop Studio open on a desk', category: 'laptops-tablets' },
  { src: '/hero/macbook-air-open.jpg', alt: 'A MacBook Air open on a soft grey rug', category: 'laptops-tablets' },
  { src: '/hero/dell-laptops.jpg', alt: 'A stack of Dell business laptops', category: 'laptops-tablets' },
  { src: '/hero/surface-laptops-stacked.jpg', alt: 'Surface Laptops stacked, the top one running a game', category: 'laptops-tablets' },
  { src: '/hero/hp-envy-boxes.jpg', alt: 'Boxed HP Envy and HP gaming laptops on the shelf', category: 'laptops-tablets' },

  // ── Phone accessories ──
  { src: '/hero/anker-soundcore-life-q30.jpg', alt: 'Anker Soundcore Life Q30 headphones', category: 'phone-accessories' },
  { src: '/hero/anker-soundcore-space-2.jpg', alt: 'Anker Soundcore Space 2 noise cancelling headphones', category: 'phone-accessories' },
  { src: '/hero/power-bank-40000mah.jpg', alt: 'A 40,000mAh power bank charging a laptop and a phone', category: 'phone-accessories' },
  { src: '/hero/portable-power-banks.jpg', alt: 'A range of portable power banks', category: 'phone-accessories' },
  { src: '/hero/chargers-and-cables.jpg', alt: 'Fast chargers and braided charging cables', category: 'phone-accessories' },
  { src: '/hero/phone-gimbal-stabilizer.jpg', alt: 'A handheld gimbal holding a phone for smooth video', category: 'phone-accessories' },
  { src: '/hero/newage-power-bank-range.jpg', alt: 'The New Age power bank range: Turbo Ultra 6, Heavy Duty Nano and Heavy Duty', category: 'phone-accessories' },
  { src: '/hero/newage-power-banks-available.jpg', alt: 'New Age Turbo Ultra 3 and Y107 Pro Max power banks with a Connect Prime 9 cable', category: 'phone-accessories' },
  { src: '/hero/newage-connect-prime-11-duo-orange.jpg', alt: 'New Age Connect Prime 11 Duo, a 65W two-in-one charging cable', category: 'phone-accessories' },
  { src: '/hero/newage-connect-prime-11-duo-silver.jpg', alt: 'New Age Connect Prime 11 Duo 65W braided cable', category: 'phone-accessories' },
  { src: '/hero/newage-connect-prime-11-duo-black.jpg', alt: 'New Age Connect Prime 11 Duo with Type C and Lightning ends', category: 'phone-accessories' },
  { src: '/hero/newage-connect-prime-11-27w.jpg', alt: 'New Age Connect Prime 11 27W Type C to Lightning cable with its box', category: 'phone-accessories' },
  { src: '/hero/oraimo-booming-bass-headphones.jpg', alt: 'oraimo Booming Bass wireless headphones', category: 'phone-accessories' },
  { src: '/hero/oraimo-airbuds-3.jpg', alt: 'oraimo Airbuds 3, waterproof true wireless earbuds', category: 'phone-accessories' },
  { src: '/hero/oraimo-necklace-lite-earphones.jpg', alt: 'oraimo Necklace Lite neckband earphones', category: 'phone-accessories' },
  { src: '/hero/boombest-ln1116plus-speaker.jpg', alt: 'BoomBest LN-1116Plus wireless speakers', category: 'phone-accessories' },
  { src: '/hero/boombest-ln5316bt-speaker.jpg', alt: 'BoomBest LN-5316BT wireless speakers', category: 'phone-accessories' },
  { src: '/hero/boombest-ln1028ant-speaker.jpg', alt: 'BoomBest LN-1028ANT wireless speakers with TF and USB', category: 'phone-accessories' },
  { src: '/hero/jbl-partybox.jpg', alt: 'A JBL PartyBox speaker with its ring lights lit', category: 'phone-accessories' },
  { src: '/hero/jbl-charge-5-boxes.jpg', alt: 'JBL Charge 5 speakers boxed in red, blue and camo', category: 'phone-accessories' },
  { src: '/hero/jbl-go-3.jpg', alt: 'JBL Go 3, a pocket-sized waterproof Bluetooth speaker', category: 'phone-accessories' },
  { src: '/hero/oraimo-earbuds-black.jpg', alt: 'oraimo wireless earbuds in their charging case', category: 'phone-accessories' },
  { src: '/hero/oraimo-necklace-2.jpg', alt: 'oraimo Necklace 2 neckband earphones with their box', category: 'phone-accessories' },
  { src: '/hero/itel-power-supply-family.jpg', alt: 'The itel power bank and wall charger range', category: 'phone-accessories' },
  { src: '/hero/apple-charger-cable.jpg', alt: 'A 20W USB-C charger with a Lightning cable', category: 'phone-accessories' },

  // ── Laptop accessories ──
  { src: '/hero/ram-ddr2-ddr3-ddr4.jpg', alt: 'Laptop memory modules: DDR2, DDR3 and DDR4 side by side', category: 'laptop-accessories' },
  { src: '/hero/ram-ddr4-desktop.jpg', alt: 'DDR4 desktop memory in 4GB, 8GB and 16GB sticks', category: 'laptop-accessories' },
  { src: '/hero/m2-ssd.jpg', alt: 'A 1TB M.2 solid state drive on a motherboard', category: 'laptop-accessories' },

  // ── Gaming setups ──
  { src: '/hero/xbox-controller-shock-blue.jpg', alt: 'Xbox wireless controller in shock blue', category: 'gaming-setup' },
  { src: '/hero/xbox-controller-carbon-black.jpg', alt: 'Xbox wireless controller in carbon black', category: 'gaming-setup' },
  { src: '/hero/curved-monitor.jpg', alt: 'A curved widescreen monitor being set up', category: 'gaming-setup' },
  { src: '/hero/ps5-console-boxed.jpg', alt: 'A PlayStation 5 unboxed with its controller and cables', category: 'gaming-setup' },
  { src: '/hero/gaming-chair-desk.jpg', alt: 'A gaming chair and desk setup', category: 'gaming-setup' },
  { src: '/hero/gaming-pc-rgb.jpg', alt: 'A gaming PC with liquid cooling and blue lit fans', category: 'gaming-setup' },
  { src: '/hero/gaming-keyboard-rgb.jpg', alt: 'A mechanical gaming keyboard lit in rainbow colours', category: 'gaming-setup' },
  { src: '/hero/gaming-keyboard-neon.jpg', alt: 'A backlit mechanical keyboard glowing in neon', category: 'gaming-setup' },
  { src: '/hero/keyboard-and-mouse.jpg', alt: 'A mechanical keyboard and gaming mouse on a desk', category: 'gaming-setup' },
  { src: '/hero/gaming-desk-led.jpg', alt: 'An LED gaming desk with a racing-style chair', category: 'gaming-setup' },
  { src: '/hero/koorui-34-monitor.jpg', alt: 'A KOORUI 34 inch ultrawide curved gaming monitor', category: 'gaming-setup' },
  { src: '/hero/msi-27-monitor.jpg', alt: 'An MSI 27 inch 2K gaming monitor on its box', category: 'gaming-setup' },

  // ── Solar & power ──
  { src: '/hero/itel-power-tank.jpg', alt: 'An itel Power Tank solar generator', category: 'solar-power' },
  { src: '/hero/cola-1000-pro-inverter.jpg', alt: 'Cola 1000-Pro inverter with 300W output', category: 'solar-power' },
  { src: '/hero/bzet-solar-generator.jpg', alt: 'A Bzet solar generator', category: 'solar-power' },
  { src: '/hero/solar-panels-roof.jpg', alt: 'Solar panels installed across a rooftop', category: 'solar-power' },
  { src: '/hero/solar-panel-kit.jpg', alt: 'A solar panel kit', category: 'solar-power' },
  { src: '/hero/newage-jump-starter.jpg', alt: 'A New Age jump starter reviving a car battery', category: 'solar-power' },
  { src: '/hero/itel-power-go-display.jpg', alt: 'itel Energy Power Go and Power Go Pro power stations on display', category: 'solar-power' },
  { src: '/hero/itel-inverter-installed.jpg', alt: 'An itel inverter and ESS battery installed on a wall', category: 'solar-power' },
  { src: '/hero/itel-4kw-inverter.jpg', alt: 'An itel 4kW Pro hybrid inverter', category: 'solar-power' },
  { src: '/hero/itel-solar-kit.jpg', alt: 'An itel Energy solar panel beside its battery unit', category: 'solar-power' },
  { src: '/hero/solar-panels-stacked.jpg', alt: 'Solar panels lined up ready for installation', category: 'solar-power' },
  { src: '/hero/colasolar-generator.jpg', alt: 'A ColaSolar portable solar generator', category: 'solar-power' },
  { src: '/hero/itel-power-go-100000mah.jpg', alt: 'The itel Power Go, a 100,000mAh portable power station', category: 'solar-power' },
  { src: '/hero/itel-power-go-130w.jpg', alt: 'The itel Power Go delivering 130W of portable power', category: 'solar-power' },

  // ── Solar & power, 2026-09-09 batch (Downloads/Header) ──
  { src: '/hero/colasolar-generator-toploading.jpg', alt: 'A ColaSolar generator with a top-loading lid', category: 'solar-power' },
  { src: '/hero/colasolar-generator-render.jpg', alt: 'A rendered view of a ColaSolar portable generator', category: 'solar-power' },
  { src: '/hero/colasolar-generator-with-boxes.jpg', alt: 'A ColaSolar generator beside its retail boxes', category: 'solar-power' },
  { src: '/hero/cola-1000-pro-box-and-unit.jpg', alt: 'The Cola 1000 Pro solar power generator with its box', category: 'solar-power' },
  { src: '/hero/fibon-solar-energy-storage-supply.jpg', alt: 'A Fibon Solar energy storage power supply with its cables, in front of solar panels', category: 'solar-power' },
  { src: '/hero/colasolar-unit-office-chair.jpg', alt: 'A white and green ColaSolar unit in an office setting', category: 'solar-power' },
  { src: '/hero/hithium-battery-pack.jpg', alt: 'A hiTHIUM home battery pack', category: 'solar-power' },
  { src: '/hero/luxwatt-lifepo4-board-6kwh.jpg', alt: 'A LUXWATT LiFePO4 battery control board, 25.6V 6kWh', category: 'solar-power' },
  { src: '/hero/luxwatt-battery-warehouse.jpg', alt: 'A LUXWATT battery unit in a warehouse of inverter stock', category: 'solar-power' },
  { src: '/hero/felicitysolar-hybrid-inverter.jpg', alt: 'A Felicity Solar pure sine wave hybrid inverter/charger', category: 'solar-power' },
  { src: '/hero/solar-panels-pair-monofacial.jpg', alt: 'Two solar panels stood side by side', category: 'solar-power' },
  { src: '/hero/warehouse-hybrid-solar-inverters.jpg', alt: 'A warehouse stacked with hybrid solar inverter boxes', category: 'solar-power' },
  { src: '/hero/sanxing-battery-cabinet.jpg', alt: 'A Sanxing wall-mounted battery cabinet', category: 'solar-power' },
  { src: '/hero/blisslife-lifepo4-battery.jpg', alt: 'A BlissLife LiFePO4 lithium battery, 51.2V 300AH', category: 'solar-power' },
  { src: '/hero/howfar-solar-security-camera.jpg', alt: 'A HOWFAR solar-powered outdoor security camera with its panel', category: 'solar-power' },
  { src: '/hero/solar-panel-warehouse-clean.jpg', alt: 'A solar panel stood in a warehouse', category: 'solar-power' },
  { src: '/hero/solar-panel-white-wall.jpg', alt: 'A solar panel leaned against a white wall', category: 'solar-power' },
  { src: '/hero/solar-panel-340w-outdoor.jpg', alt: 'A 340W solar panel stood outdoors', category: 'solar-power' },
  { src: '/hero/deye-inverter-easyway-batteries.jpg', alt: 'A Deye inverter installed above two EASYWAY batteries', category: 'solar-power' },
  { src: '/hero/easyway-univ-10kwh-battery.jpg', alt: 'An EASYWAY UNIV 10kWh home battery', category: 'solar-power' },
  { src: '/hero/solar-panels-row-leaning.jpg', alt: 'A row of solar panels leaned against a wall', category: 'solar-power' },
  { src: '/hero/warehouse-power-stations-shelf.jpg', alt: 'Shelves stacked with portable power stations', category: 'solar-power' },
  { src: '/hero/lifepo4-energy-storage-boxes-warehouse.jpg', alt: 'Boxed LiFePO4 energy storage power supplies in a warehouse', category: 'solar-power' },
  { src: '/hero/colasolar-plus-outdoor-grass.jpg', alt: 'A ColaSolar Plus generator stood outdoors on grass', category: 'solar-power' },
  { src: '/hero/charmeek-solar-fan-light-kit.jpg', alt: 'A solar-powered standing fan and light kit with its panel', category: 'solar-power' },
  { src: '/hero/colasolar-plus-outdoor-rooftop.jpg', alt: 'A ColaSolar Plus generator outdoors with rooftops behind it', category: 'solar-power' },
  { src: '/hero/solar-panel-mono-720w.jpg', alt: 'A 720W monocrystalline solar panel beside its box', category: 'solar-power' },
  { src: '/hero/jordy-ele-voltage-regulator.jpg', alt: 'A JORDY-ELE automatic voltage regulator', category: 'solar-power' },
  { src: '/hero/luxwatt-lifepo4-battery-box.jpg', alt: 'A LUXWATT LiFePO4 battery with its packaging', category: 'solar-power' },
  { src: '/hero/solar-panel-outdoor-stacked-panels.jpg', alt: 'A solar panel stood outdoors with more panels stacked behind it', category: 'solar-power' },
  { src: '/hero/colasolar-plus-outdoor-person.jpg', alt: 'A ColaSolar Plus generator being carried outdoors', category: 'solar-power' },
];
