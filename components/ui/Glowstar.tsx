import Image from 'next/image';
import glowingStar from '@/public/images/starNoOutline.svg';

interface GlowStarTypes {
  className: string;
}

export const GlowStar = ({ className }: GlowStarTypes) => {
  return (
    <div className={`relative ${className}`}>
      <div className='absolute -top-[150%] -left-[150%] min-w-[400%] min-h-[400%] rotate-45 blur-lg opacity-10 bg-yellow '></div>
      <div>
        <Image src={glowingStar} alt='glowing star icon' className='w-full' />
      </div>
    </div>
  );
};
