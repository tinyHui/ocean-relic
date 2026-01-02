interface BaseBoardProps {
  boardImage: string
  children?: React.ReactNode
}

export const BaseBoard = ({ boardImage, children }: BaseBoardProps) => {
  return (
    <div
      className="board-surface"
      style={{ backgroundImage: `url(${boardImage})` }}
    >
      {children}
    </div>
  )
}
