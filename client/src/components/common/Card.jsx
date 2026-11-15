export const Card = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
