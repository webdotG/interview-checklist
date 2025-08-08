export class NotificationService {
  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div')
    notification.className = `notification notification--${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add('notification--show')
    }, 10)

    if (duration > 0) {
      setTimeout(() => {
        this.hide(notification)
      }, duration)
    }

    return notification
  }

  hide(notification) {
    notification.classList.add('notification--hide')
    setTimeout(() => notification.remove(), 300)
  }
}
