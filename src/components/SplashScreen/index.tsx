import { useTheme } from '../../hooks/useTheme'
import { Logo } from '../Logo'
import './styles.scss'

export function SplashScreen() {
    const { theme } = useTheme()

    return (
        <div id="page-load" className={theme}>
            <Logo id="loading" />
        </div>
    )
}