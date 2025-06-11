import React, {
  useRef,
  useState,
  useEffect,
  ReactNode,
  MouseEventHandler,
} from "react"
import { motion, useInView } from "framer-motion"

interface AnimatedItemProps {
  children: ReactNode
  delay?: number
  index: number
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5, once: false })
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  items?: React.ReactNode[]
  onItemSelect?: (item: React.ReactNode, index: number) => void
  enableArrowNavigation?: boolean
  className?: string
  itemClassName?: string
  initialSelectedIndex?: number
  maxHeight?: string
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items = [],
  onItemSelect,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  initialSelectedIndex = -1,
  maxHeight,
}) => {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] =
    useState<number>(initialSelectedIndex)
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false)

  useEffect(() => {
    if (!enableArrowNavigation) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault()
          if (onItemSelect) {
            onItemSelect(items[selectedIndex], selectedIndex)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation])

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return
    const container = listRef.current
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null
    if (selectedItem) {
      const extraMargin = 50
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const itemTop = selectedItem.offsetTop
      const itemBottom = itemTop + selectedItem.offsetHeight
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" })
      } else if (
        itemBottom >
        containerScrollTop + containerHeight - extraMargin
      ) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        })
      }
    }
    setKeyboardNav(false)
  }, [selectedIndex, keyboardNav])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={listRef}
        className={`${maxHeight ?? "max-h-[70vh]"} overflow-y-auto p-4`}
        style={{
          scrollbarWidth: "none",
        }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            delay={0.1}
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index)
              if (onItemSelect) {
                onItemSelect(item, index)
              }
            }}
          >
            <div className={`p-0 ${itemClassName}`}>{item}</div>
          </AnimatedItem>
        ))}
      </div>
    </div>
  )
}

export default AnimatedList
