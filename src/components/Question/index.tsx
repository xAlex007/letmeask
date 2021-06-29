import { ReactNode } from "react"
import cN from "classnames"
import "./styles.scss"

type QuestionProps = {
  content: string
  author: {
    name: string
    avatar: string
  }
  children?: ReactNode
  isAnswered?: boolean
  isHighlited?: boolean
}

/*props*/
export function Question({
  content,
  author,
  isAnswered = false,
  isHighlited = false,
  children,
}: QuestionProps) {
  return (
    /*className={`question ${isAnswered ? 'answered' : ''} ${isHighlited ? 'highlighted' : ''}`}*/
    <div
      className={cN(
        "question",
        { answered: isAnswered },
        { highlighted: isHighlited && !isAnswered }
      )}>
      <p>{content}</p>
      <footer>
        <div className="user-info">
          <img src={author.avatar} alt={author.name} />
          <span>{author.name}</span>
        </div>
        <div>{children}</div>
      </footer>
    </div>
  )
}
