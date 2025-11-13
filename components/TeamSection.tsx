import React, { useRef, useEffect, useCallback } from 'react';

const teamMembers = [
  { name: "Nathan Freitas", role: "CEO & Web Designer", image: "https://i.imgur.com/FDhmyHS.jpeg" },
  { name: "Manu Freire", role: "CEO & Dev Back-end", image: "https://i.imgur.com/oQSnHQk.jpeg" },
  { name: "Thauan Souza", role: "Desenvolvedor Front-end", image: "https://i.imgur.com/Ryjc3Vf.jpeg" },
  { name: "Clara Abreu", role: "Modelo & Influencer", image: "https://i.imgur.com/ahQjUz5.jpeg" },
  { name: "Luan Ramos", role: "Gestor de CRM´s", image: "https://i.imgur.com/QWjLjUP.jpeg" },
];

const TeamMemberCard: React.FC<{ name: string, role: string, image: string }> = ({ name, role, image }) => {
    return (
        <div className="text-center group">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 transform group-hover:scale-105 transition-transform duration-300">
                <img src={image} alt={name} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent"></div>
            </div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-[#FF007F]">{role}</p>
        </div>
    );
}

const TeamSection: React.FC = () => {
  const carouselRef = useRef<HTMLUListElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const isHovering = useRef(false);

  const duplicatedMembers = [...teamMembers, ...teamMembers];

  const onMouseDown = (e: React.MouseEvent<HTMLUListElement>) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.cursor = 'grabbing';
    carouselRef.current.style.userSelect = 'none';
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    isHovering.current = false;
    if(carouselRef.current) carouselRef.current.style.cursor = 'grab';
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if(carouselRef.current) {
        carouselRef.current.style.cursor = 'grab';
        carouselRef.current.style.removeProperty('user-select');
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLUListElement>) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onTouchStart = (e: React.TouchEvent<HTMLUListElement>) => {
     if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  }
  
  const onTouchEnd = () => {
    isDragging.current = false;
  }

  const onTouchMove = (e: React.TouchEvent<HTMLUListElement>) => {
    if (!isDragging.current || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  }

  const autoScroll = useCallback(() => {
    if (carouselRef.current && !isDragging.current && !isHovering.current) {
      const { scrollLeft, scrollWidth } = carouselRef.current;
      const totalContentWidth = scrollWidth / 2;
      
      if (scrollLeft >= totalContentWidth) {
        carouselRef.current.scrollLeft -= totalContentWidth;
      } else {
        carouselRef.current.scrollLeft += 0.5;
      }
    }
    animationFrameId.current = requestAnimationFrame(autoScroll);
  }, []);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(autoScroll);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [autoScroll]);


  return (
    <section id="time" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#FF007F] to-purple-600 rounded-full blur-[150px] opacity-10 -z-10"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-gradient-to-l from-pink-500 to-rose-600 rounded-full blur-[150px] opacity-10 -z-10"></div>

        <div className="relative z-10">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-manrope font-extrabold mb-4">
                Nosso <span className="text-[#FF007F]">Time</span>
                </h2>
                <p className="max-w-2xl mx-auto text-zinc-400 mb-16">
                Uma equipe criativa e apaixonada por tecnologia, pronta para transformar suas ideias em realidade.
                </p>
            </div>
             <ul 
                ref={carouselRef}
                className="flex items-start overflow-x-auto hide-scrollbar space-x-8 px-4 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
                style={{ cursor: 'grab' }}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onTouchMove={onTouchMove}
                onMouseEnter={() => isHovering.current = true}
            >
                {duplicatedMembers.map((member, index) => (
                    <li key={`${member.name}-${index}`} className="w-64 flex-shrink-0">
                        <TeamMemberCard {...member} />
                    </li>
                ))}
            </ul>
        </div>
    </section>
  );
};

export default TeamSection;