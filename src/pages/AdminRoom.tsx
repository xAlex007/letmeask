import { Fragment, useEffect, useState } from 'react'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import Modal from 'react-modal'
import toast from 'react-hot-toast'

import { database } from '../services/firebase'

import { useRoom } from '../hooks/useRoom'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'

import { SplashScreen } from '../components/SplashScreen'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { LogoutButton } from '../components/LogoutButton'
import { ThemeButton } from '../components/ThemeButton'
import { RoomCode } from '../components/RoomCode'
import { Question } from '../components/Question'

import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'
import deleteImg from '../assets/images/delete.svg'
import '../styles/room.scss'

type RoomParams = {
    id: string
}

type RoomProps = {
    authorId: string,
    title: string
}

export function AdminRoom() {
    const { user, signOut } = useAuth()
    const [isAuthor, setIsAuthor] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const history = useHistory()
    const { theme, toggleTheme } = useTheme()
    const params = useParams<RoomParams>()
    const roomId = params.id
    const [questionModalVisible, setQuestionModalVisible] = useState<string | undefined>()
    const { title, questions } = useRoom(roomId)

    useEffect(() => { handleAuthorized() }, [user?.id])

    async function handleAuthorized() {
        const roomRef = await database.ref(`rooms/${roomId}`).once('value', result => {
            const room: RoomProps = result.val()
            setIsAuthor(room.authorId === user?.id)
            setLoaded(true)
        })
    }

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

    if (loaded) {
        if (isAuthor) {
            return (
                <div id="page-room" className={theme}>
                    <header>
                        <div className="content">
                            <Logo className={theme}></Logo>
                            <div>
                                <RoomCode code={roomId} />
                                <Button onClick={handleEndRoom}>Encerrar sala</Button>
                                <LogoutButton onClick={signOut} />
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
        } else {
            return (
                <Fragment>
                    {toast.error('Acesso negado.', { id: 'denied' })}
                    <Redirect to="/" />
                </Fragment>
            )
        }
    } else {
        return (
            <SplashScreen />
        )
    }
}