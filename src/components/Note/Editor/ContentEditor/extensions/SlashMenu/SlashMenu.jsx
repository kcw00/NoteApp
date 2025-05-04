import React, { useEffect, useState, useImperativeHandle } from 'react'
import '../../../styles/SlashMenu.css'

const SlashMenu = React.forwardRef(({ items = [], command, theme }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const selectItem = (index) => {
    const item = items[index]
    if (item) command(item)
  }

  const upHandler = () => {
    setSelectedIndex((prev) => {
      const next = (prev + items.length - 1) % items.length
      //console.log('[SlashMenu] new selected index (up):', next)
      scrollItemIntoView(next)
      return next
    })
  }

  const downHandler = () => {
    setSelectedIndex((prev) => {
      const next = (prev + 1) % items.length
      //console.log('[SlashMenu] new selected index (down):', next)
      scrollItemIntoView(next)
      return next
    })
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  // This is the key: expose keydown handling via ref
  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      //console.log('[SlashMenu] onKeyDown fired')
      if (!event) return false
      if (event.key === 'ArrowUp') {
        // console.log('[SlashMenu] ArrowUp')
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        // console.log('[SlashMenu] ArrowDown')
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        // console.log('[SlashMenu] Enter')
        enterHandler()
        return true
      }
      return false
    }
  }))

  // auto scroll when the selected item is out of view
  const scrollItemIntoView = (index) => {
    const el = document.querySelector(`.slash-menu button[data-index="${index}"]`)
    const container = document.querySelector('.slash-menu')
  
    if (!el || !container) return
  
    const elTop = el.offsetTop
    const elBottom = elTop + el.offsetHeight
    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight
  
    if (elTop < containerTop) {
      container.scrollTop = elTop
    } else if (elBottom > containerBottom) {
      container.scrollTop = elBottom - container.clientHeight
    }
  }

  return (
    <div className={`slash-menu ${theme === 'light' ? '' : 'dark'}`}>
      {items.length > 0 ? (
        items.map((item, index) => (
          <button
            key={index}
            data-index={index}
            className={`slash-menu button ${index === selectedIndex ? 'is-selected' : ''} ${theme === 'light' ? '' : 'dark'}`}
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault()
              selectItem(index)
            }}
          >
            {item.title}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  )
})

export default SlashMenu