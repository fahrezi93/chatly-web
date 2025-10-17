import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SocketProvider } from './context/SocketContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Disabled StrictMode to prevent double socket connections
  // <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  // </React.StrictMode>,
)
