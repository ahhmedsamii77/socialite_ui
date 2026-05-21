import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from 'lucide-react'

export default function ToggleThemeBtn() {
  const { theme, setTheme } = useTheme();
  function handleToggleTheme() {
    if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }
  return (
    <Button
    className='cursor-pointer xl:w-full w-fit bg-transparent! justify-start h-11 rounded-xl font-medium text-[14px]
    relative px-4!
     before:content-[""] before:absolute before:h-1/2 before:opacity-0 xl:hover:before:opacity-100 before:transition before:duration-200 before:w-0.5 before:bg-primary before:left-0 
      before:rounded-r-sm
      hover:bg-primary/10! after:content-[""] after:absolute after:transition after:duration-200 after:bg-linear-[105deg] after:from-primary/20 after:to-transparent/65 after:w-full after:h-full after:left-0 after:rouned-xl overflow-hidden after:opacity-0 hover:after:opacity-100 hover:translate-x-1 duration-200 transition group'
     variant="ghost" 
     onClick={handleToggleTheme}>
      {theme === "light" && <>
        <MoonIcon size={20} className='text-base-muted! group-hover:text-primary! transition duration-200'/>
        <span className='text-base-muted! group-hover:text-foreground transition duration-200 hidden xl:block'>Dark Mode</span>
      </>
      }
      {theme === "dark" &&
        <>
          <SunIcon size={20} className='text-base-muted! group-hover:text-primary! transition duration-200' />
          <span className='text-base-muted hidden xl:block group-hover:text-foreground transition duration-200'>Light Mode</span>
        </>
      }
    </Button>
  )
}
