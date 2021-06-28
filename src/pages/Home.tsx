import { useHistory } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/Button'
import '../styles/auth.scss'
import { Logo } from '../components/Logo'
import illustrationImg from '../assets/images/illustration.svg'
import googleiconImg from '../assets/images/google-icon.svg'
import { FormEvent, useState } from 'react'
import { database } from '../services/firebase'
import { useTheme } from '../hooks/useTheme'
import { ThemeButton } from '../components/ThemeButton'
import { Toaster } from 'react-hot-toast'

export function Home() {
    const history = useHistory()
    const { user, signInWithGoogle } = useAuth()
    const [roomCode, setRoomCode] = useState('')
    const { theme, toggleTheme } = useTheme()

    async function handleCreateRoom() {
        if (!user) {
            await signInWithGoogle()
        }

        history.push('/rooms/new')
    }

    async function handleJoinRoom(event: FormEvent) {
        event.preventDefault()

        if (roomCode.trim() === '') {
            return
        }

        const roomRef = await database.ref(`rooms/${roomCode}`).get()

        if (!roomRef.exists()) {
            alert('Sala não existe.')
            return
        }

        if (roomRef.val().endedAt) {
            alert('Essa sala foi fechada.')
            return
        }

        history.push(`/rooms/${roomCode}`)
    }

    return (
        <div id="page-auth" className={theme}>

            <aside>
                <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
                <strong>Crie salas de Q&amp;A ao vivo</strong>
                <p>Tire as dúvidas da sua audiência em tempo real</p>
            </aside>

            <main>
                <div className="main-content">
                    <div className="navbar">
                        <ThemeButton onClick={toggleTheme}></ThemeButton>
                    </div>
                    <div className="content">
                        <Logo className={theme}></Logo>
                        <button onClick={handleCreateRoom} className="create-room">
                            <img src={googleiconImg} alt="Logo do Google" />
                            Crie sua sala com o Google
                        </button>
                        <div className="separator">Ou entre em uma sala</div>
                        <form onSubmit={handleJoinRoom}>
                            <input type="text" placeholder="Digite o código da sala" onChange={event => setRoomCode(event.target.value)} value={roomCode} />
                            <Button type="submit">Entrar na sala</Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}