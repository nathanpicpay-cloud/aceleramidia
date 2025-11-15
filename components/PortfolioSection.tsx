
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import type { Project } from '../App';

interface PortfolioSectionProps {
  projects: Project[];
}

const PortfolioItemCard: React.FC<Project> = ({ name, image, link, updated_at }) => {
  // Firebase Storage URLs from getDownloadURL include a token. Appending another parameter requires an '&'.
  // This logic correctly appends a cache-busting parameter without breaking the download token.
  const isFirebaseImage = image && image.includes('firebasestorage.googleapis.com');
  const imageUrl = isFirebaseImage && updated_at 
    ? `${image}&v=${new Date(updated_at).getTime()}` 
    : image;

  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block group w-full h-full relative rounded-2xl overflow-hidden 
                 shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:shadow-[0_0_25px_rgba(255,0,127,0.7)] 
                 transition-all duration-300 transform hover:scale-105"
    >
      <img src={imageUrl} alt={name} className="w-full h-full object-cover object-top" />
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white text-lg font-bold text-center px-2">{name}</h3>
      </div>
    </a>
  );
};

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ projects }) => {
  const carouselRef = useRef<HTMLUListElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const isHovering = useRef(false);

  const duplicatedItems = useMemo(() => (projects && projects.length > 0 ? [...projects, ...projects] : []), [projects]);


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
  };
  
  const onTouchEnd = () => {
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLUListElement>) => {
    if (!isDragging.current || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

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
  
  if (!projects || projects.length === 0) {
    return (
        <section id="portfolio" className="py-20 md:py-32 overflow-hidden">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-4xl md:text-5xl font-manrope font-extrabold mb-4">
                    Projetos <span className="text-[#FF007F]">Recentes</span>
                 </h2>
                 <p className="max-w-2xl mx-auto text-zinc-400">Nenhum projeto para exibir no momento.</p>
            </div>
        </section>
    )
  }

  return (
    <section id="portfolio" className="py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-manrope font-extrabold mb-4">
            Projetos <span className="text-[#FF007F]">Recentes</span>
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-400">
            Confira alguns dos sites e sistemas desenvolvidos pela Acelera Mídia.
          </p>
      </div>
      
      <ul 
        ref={carouselRef}
        className="flex items-center overflow-x-auto hide-scrollbar space-x-8 px-4 py-8 [mask-image:_linear_gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
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
        {duplicatedItems.map((item, index) => (
          <li key={`${item.id}-${index}`} className="w-48 h-96 flex-shrink-0">
            <PortfolioItemCard {...item} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PortfolioSection;