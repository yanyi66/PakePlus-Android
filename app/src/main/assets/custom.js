window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// very important, 禁止图片下载，点击只能放大
// 可以挡住 80% 的右键保存，也可以让前端骂 1000+ 次
const preventImageOps = (e) => {
    // 拦截右键菜单（阻止"图片另存为"）
    if (e.type === 'contextmenu') {
        const img = e.target.closest('img')
        if (img) {
            e.preventDefault()
            console.log('block contextmenu on img', img)
        }
        return
    }

    // 拦截拖拽（防止拖到地址栏/桌面保存）
    if (e.type === 'dragstart') {
        const img = e.target.closest('img')
        if (img) {
            e.preventDefault()
            console.log('block drag on img', img)
        }
        return
    }

    // 拦截点击 —— 放大图片而非触发任何下载/跳转
    if (e.type === 'click') {
        const img = e.target.closest('img')
        if (!img || !img.src) {
            console.log('not an img click, skip')
            return
        }
        e.preventDefault()
        e.stopPropagation()
        console.log('zoom img', img.src)
        zoomImage(img)
    }
}

// 放大镜：创建一个全屏遮罩展示大图，点击关闭
const zoomImage = (img) => {
    // 如果已有遮罩，先移除（防重复）
    const old = document.getElementById('__img_zoom_mask')
    if (old) old.remove()

    const mask = document.createElement('div')
    mask.id = '__img_zoom_mask'
    mask.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:100vw',
        'height:100vh',
        'background:rgba(0,0,0,0.85)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'z-index:99999',
        'cursor:zoom-out'
    ].join(';')

    const big = document.createElement('img')
    big.src = img.src
    big.style.cssText = [
        'max-width:90vw',
        'max-height:90vh',
        'object-fit:contain',
        'user-select:none',
        '-webkit-user-drag:none',
        'pointer-events:none'
    ].join(';')

    mask.appendChild(big)

    // 点击遮罩任意区域关闭
    mask.addEventListener('click', () => {
        mask.remove()
    })

    // ESC 也可关闭
    const onEsc = (ev) => {
        if (ev.key === 'Escape') {
            mask.remove()
            document.removeEventListener('keydown', onEsc)
        }
    }
    document.addEventListener('keydown', onEsc)

    document.body.appendChild(mask)
}

// 捕获阶段注册，抢在业务代码之前
document.addEventListener('contextmenu', preventImageOps, { capture: true })
document.addEventListener('dragstart',  preventImageOps, { capture: true })
document.addEventListener('click',      preventImageOps, { capture: true })

// 覆盖原生右键菜单（兜底，有些浏览器 contextmenu 事件挡不住）
window.oncontextmenu = function (e) {
    if (e.target.closest('img')) {
        console.log('block native contextmenu')
        return false
    }
}
