import { useState, useRef } from 'react';
import { 
  TabButton, 
  RadioOption, 
  QuantitySelector, 
  StickyButton, 
  ZoneCard,
  DotNavigation,
  PoweredByFever,
  colors, 
  fonts,
  formatPrice,
} from '../components';
import type { ZoneData, TabType } from '../lib/types';

// ============================================
// VENUE DATA - EDIT THIS SECTION FOR NEW VENUE
// ============================================

const VENUE_CONFIG = {
  name: 'Venue Name',
  title: 'Event Title Here',
  date: 'Sábado 15 Marzo 2026, 21:00',
  heroImage: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const ZONES: ZoneData[] = [
  {
    id: 'zone-1',
    name: 'VIP Zone',
    shortName: 'VIP',
    price: 500,
    capacity: 6,
    description: 'Premium experience with the best views and exclusive services.',
    features: ['2 bottles included', 'Fast access', 'Private bathroom', 'VIP parking'],
    color: '#d4af37',
    image: 'https://images.pexels.com/photos/2114365/pexels-photo-2114365.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
  {
    id: 'zone-2',
    name: 'Premium Zone',
    shortName: 'Premium',
    price: 300,
    capacity: 4,
    description: 'Great views with premium services.',
    features: ['1 bottle included', 'Fast access', 'Reserved seating'],
    color: '#8a1343',
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
  {
    id: 'zone-3',
    name: 'General Zone',
    shortName: 'General',
    price: 50,
    capacity: 1,
    description: 'Standard access to the event.',
    features: ['Event access', 'Standing area'],
    color: '#536b75',
    image: 'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
];

const TABS: { id: TabType; label: string }[] = [
  { id: 'general', label: 'Entrada General' },
  { id: 'mesas', label: 'Mesas/Reservados' },
];

// ============================================
// COMPONENTS
// ============================================

function Navbar() {
  return (
    <nav 
      className="bg-white flex items-center justify-between px-[24px] py-[12px] w-full fixed top-0 left-0 right-0 z-50" 
      style={{ borderBottom: `1px solid ${colors.background}` }}
    >
      <div className="flex items-center gap-[24px]">
        <span style={{ fontSize: '24px', fontWeight: 700, color: colors.primary }}>fever</span>
      </div>
      <div className="flex items-center gap-[16px]">
        <div 
          className="w-[42px] h-[42px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.accent.blueLight }}
        >
          <svg className="w-[20px] h-[20px]" style={{ color: colors.accent.blue }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <div className="relative w-full">
      <div 
        className="w-full h-[300px] md:h-[405px] bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${VENUE_CONFIG.heroImage})` 
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-[16px] md:p-[32px]">
        <div className="max-w-[1280px] mx-auto">
          <h1 
            className="text-[28px] font-semibold text-white leading-[40px]"
            style={{ fontFamily: fonts.heading }}
          >
            {VENUE_CONFIG.title}
          </h1>
          <p className="text-white text-[16px] mt-[8px] opacity-90">
            {VENUE_CONFIG.date}
          </p>
        </div>
      </div>
    </div>
  );
}

function TicketSelector({ 
  activeTab, 
  onTabChange, 
  selectedZone, 
  onZoneSelect,
  quantity,
  onQuantityChange,
}: { 
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedZone: string;
  onZoneSelect: (id: string) => void;
  quantity: number;
  onQuantityChange: (delta: number) => void;
}) {
  const tickets = activeTab === 'mesas' 
    ? ZONES.map(z => ({ id: z.id, name: z.name, price: z.price, subtitle: `Para ${z.capacity} personas` }))
    : [{ id: 'general-1', name: 'Entrada General', price: 50, subtitle: 'Acceso estándar' }];

  return (
    <div 
      className="flex flex-col w-full max-w-[412px] bg-white rounded-[1rem]"
      style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 0px 6px 0px' }}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-[8px] p-[1rem]"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <svg className="w-[24px] h-[24px]" style={{ color: colors.textDark }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.textDark }}>
          Selecciona tipo de entrada
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-[0.75rem] p-[1rem] overflow-x-auto scrollbar-hide" style={{ borderBottom: `1px solid ${colors.border}` }}>
        {TABS.map(tab => (
          <TabButton 
            key={tab.id}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>

      {/* Ticket Options */}
      <div className="flex flex-col">
        {tickets.map((ticket, i) => (
          <RadioOption
            key={ticket.id}
            label={ticket.name}
            sublabel="Más info"
            price={formatPrice(ticket.price)}
            isSelected={selectedZone === ticket.id}
            onClick={() => onZoneSelect(ticket.id)}
            isLast={i === tickets.length - 1}
          />
        ))}
      </div>

      {/* Quantity + Footer */}
      <div className="flex flex-col gap-[1rem] p-[1rem]" style={{ borderTop: `1px solid ${colors.border}` }}>
        <QuantitySelector
          quantity={quantity}
          onIncrement={() => onQuantityChange(1)}
          onDecrement={() => onQuantityChange(-1)}
        />
        <PoweredByFever />
      </div>
    </div>
  );
}

function ZoneCarousel({ 
  selectedZone, 
  onZoneSelect 
}: { 
  selectedZone: string; 
  onZoneSelect: (id: string) => void;
}) {
  const selectedIndex = ZONES.findIndex(z => z.id === selectedZone);
  const displayIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  const goToNext = () => {
    const nextIndex = (displayIndex + 1) % ZONES.length;
    onZoneSelect(ZONES[nextIndex].id);
  };

  const goToPrev = () => {
    const prevIndex = (displayIndex - 1 + ZONES.length) % ZONES.length;
    onZoneSelect(ZONES[prevIndex].id);
  };

  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.textDark }}>
          Selecciona tu zona
        </h2>
        <span style={{ fontSize: '0.875rem', color: colors.textMuted }}>
          {displayIndex + 1} / {ZONES.length}
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-[0.75rem] overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {ZONES.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            isSelected={zone.id === selectedZone}
            onClick={() => onZoneSelect(zone.id)}
            showNavigationArrows={zone.id === selectedZone}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        ))}
      </div>

      <DotNavigation
        total={ZONES.length}
        current={displayIndex}
        onChange={(i) => onZoneSelect(ZONES[i].id)}
      />
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

export function PublicSalePage() {
  const [activeTab, setActiveTab] = useState<TabType>('mesas');
  const [selectedZone, setSelectedZone] = useState(ZONES[0].id);
  const [quantity, setQuantity] = useState(1);
  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedZoneData = ZONES.find(z => z.id === selectedZone);
  const totalPrice = (selectedZoneData?.price || 0) * quantity;

  const scrollToSelector = () => {
    selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleZoneSelect = (id: string) => {
    setSelectedZone(id);
    setActiveTab('mesas');
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: fonts.body }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Muli:wght@400;600;700&display=swap" rel="stylesheet" />
      
      <Navbar />
      
      <main className="pt-[62px] pb-[80px] lg:pb-0">
        <HeroSection />
        
        <div className="max-w-[1280px] mx-auto px-[16px] md:px-[32px] py-[32px]">
          <div className="flex flex-col lg:flex-row gap-[32px]">
            {/* Left Column */}
            <div className="flex-1 min-w-0 flex flex-col gap-[32px]">
              <ZoneCarousel 
                selectedZone={selectedZone} 
                onZoneSelect={handleZoneSelect} 
              />
              
              {/* Mobile Ticket Selector */}
              <div ref={selectorRef} className="lg:hidden">
                <TicketSelector
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selectedZone={selectedZone}
                  onZoneSelect={setSelectedZone}
                  quantity={quantity}
                  onQuantityChange={(d) => setQuantity(Math.max(1, quantity + d))}
                />
              </div>
            </div>
            
            {/* Right Column - Desktop */}
            <div className="hidden lg:block w-[412px] flex-shrink-0">
              <div className="sticky top-[80px]">
                <TicketSelector
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selectedZone={selectedZone}
                  onZoneSelect={setSelectedZone}
                  quantity={quantity}
                  onQuantityChange={(d) => setQuantity(Math.max(1, quantity + d))}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <StickyButton
        label="Seleccionar entradas"
        price={totalPrice}
        onClick={scrollToSelector}
      />
    </div>
  );
}
