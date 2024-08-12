import cn from '@/utils/general/cn';

interface ContainerType {
  children: React.ReactNode;
  bordered?: boolean;
  first?: boolean;
  fullscreen?: boolean;
  color?: string;
  className?: string;
  removeInnerPadding?: boolean;
}

const Container = ({
  children,
  bordered = true,
  first = false,
  fullscreen = false,
  color = 'transparent',
  className,
  removeInnerPadding,
}: ContainerType) => {
  return (
    <div
      className={cn(
        'w-screen flex justify-center px-4 md:px-6 lg:px-8',
        {
          'bg-dark': color === 'dark',
          'bg-black': color === 'black',
          'bg-transparent': color === 'transparent',
        },
        className
      )}
    >
      <div
        className={cn('w-full max-w-[1400px] p-4 md:p-6 lg:p-8', {
          'p-0 md:p-0 lg:p-0': removeInnerPadding,
          'border-x-[1px] border-grey10': bordered,
          'pt-[96px] md:pt-[104px] lg:pt-[112px]': first,
          'min-h-screen': fullscreen,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default Container;
