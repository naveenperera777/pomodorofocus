interface SessionSelectorProps {
  onSelectDuration: (duration: number) => void;
  disabled?: boolean;
}

export const SessionSelector = ({ onSelectDuration, disabled = false }: SessionSelectorProps) => {
  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      <h2 className="text-3xl font-bold text-text-primary mb-4">Start a Focus Session</h2>
      <div className="flex space-x-4">
        <button
          onClick={() => onSelectDuration(5)}
          disabled={disabled}
          className="px-8 py-6 bg-primary text-background-dark rounded-lg font-semibold text-xl hover:bg-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          5 Minutes
        </button>
        <button
          onClick={() => onSelectDuration(10)}
          disabled={disabled}
          className="px-8 py-6 bg-primary text-background-dark rounded-lg font-semibold text-xl hover:bg-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          10 Minutes
        </button>
      </div>
    </div>
  );
};
