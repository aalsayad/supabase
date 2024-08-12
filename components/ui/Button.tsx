import cn from '@/utils/general/cn';
import { ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ButtonTypes {
  children?: React.ReactNode;
  type: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'pill';
  size?: 'small' | 'base' | 'square';
  chevron?: boolean;
  arrow?: boolean;
  className?: string;
  icon?: React.ReactElement;
  left?: any;
}

const Button = ({ children, type, size = 'base', chevron, arrow, className, icon, left = false }: ButtonTypes) => {
  return (
    <>
      <div
        className={cn(
          'group border-[1px] border-white/15 rounded-md cursor-pointer flex items-center justify-center gap-1 md:gap-2 bg-white/15 hover:bg-white/20  hover:border-white/30 select-none',

          {
            'flex-row-reverse': left,
            'text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1': size === 'small',
            'text-[13px] md:text-sm px-3 md:px-4 py-[3px] md:py-[5px]': size === 'base',
            'p-0': size === 'square',
            'border-transparent bg-white/95 hover:bg-white/85 text-dark font-normal': type === 'primary',
            'bg-white/5 hover:bg-white/10 hover:border-white/15 opacity-80 hover:opacity-100': type === 'secondary',
            'bg-transparent hover:bg-transparent border-transparent opacity-50 hover:opacity-100 hover:border-transparent px-1':
              type === 'ghost',
            'pointer-events-none cursor-default rounded-full bg-white/5 border-white/0': type === 'pill',
            'bg-white/5 font-regular hover:bg-red-900/50 hover:border-red-800/60 opacity-80 hover:opacity-100':
              type === 'destructive',
          },
          className
        )}
      >
        {children}
        {chevron && (
          <>
            <ChevronRightIcon className='w-3 group-hover:opacity-100 opacity-70' />
          </>
        )}
        {arrow && (
          <>
            <ArrowRightIcon className='w-3 group-hover:opacity-100 opacity-70' />
          </>
        )}
        {icon && <div className='group-hover:opacity-100 opacity-70'>{icon}</div>}
      </div>
    </>
  );
};

export default Button;
