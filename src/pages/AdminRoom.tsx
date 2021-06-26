import { Fragment, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import Modal from 'react-modal'
import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'
import deleteImg from '../assets/images/delete.svg'
import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'
import '../styles/room.scss'
import { Question } from '../components/Question'
import { useRoom } from '../hooks/useRoom'
import { database } from '../services/firebase'
import { useTheme } from '../hooks/useTheme'
import { Logo } from '../components/Logo'
import { ThemeButton } from '../components/ThemeButton'

type RoomParams = {
    id: string
}

export function AdminRoom() {
    //const { user } = useAuth()
    const history = useHistory()
    const { theme, toggleTheme } = useTheme()
    const params = useParams<RoomParams>()
    const roomId = params.id
    const [questionModalVisible, setQuestionModalVisible] = useState<string | undefined>()
    const { title, questions } = useRoom(roomId)

    async function handleDeleteQuestion(questionId: string | undefined) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
        setQuestionModalVisible(undefined)
    }

    async function handleCheckAsAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true
        })
    }

    async function handleHighlightQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlited: true
        })
    }

    async function handleEndRoom() {
        database.ref(`rooms/${roomId}`).update({
            endedAt: new Date()
        })

        history.push('/')
    }

    return (
        <div id="page-room" className={theme}>
            <header>
                <div className="content">
                    <Logo className={theme}></Logo>
                    <div>
                        <RoomCode code={roomId} />
                        <Button onClick={handleEndRoom}>Encerrar sala</Button>
                        <ThemeButton onClick={toggleTheme}></ThemeButton>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>

                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Question key={question.id} author={question.author} content={question.content}
                                isAnswered={question.isAnswered} isHighlited={question.isHighlited}>
                                {!question.isAnswered && (
                                    <Fragment>
                                        <button type="button" onClick={() => handleCheckAsAnswered(question.id)}>
                                            <img src={checkImg} alt="Marcar pergunta como respondida" />
                                        </button>
                                        <button type="button" onClick={() => handleHighlightQuestion(question.id)}>
                                            <img src={answerImg} alt="Dar destaque à pergunta" />
                                        </button>
                                    </Fragment>
                                )}
                                <button type="button" onClick={() => setQuestionModalVisible(question.id)}>
                                    <img src={deleteImg} alt="Remover pergunta" />
                                </button>
                            </Question>
                        )
                    })}
                </div>
            </main>
            <Modal isOpen={questionModalVisible !== undefined} onRequestClose={() => setQuestionModalVisible(undefined)}>
                <button onClick={() => handleDeleteQuestion(questionModalVisible)}>Deletar</button>
                <button onClick={() => setQuestionModalVisible(undefined)}>Fechar</button>
            </Modal>
        </div>
    )
}