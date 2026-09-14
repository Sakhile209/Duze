export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    fire: <path d="M13 2c1 6-5 6-3 11 2-1 3-3 3-5 5 4 7 7 5 11-3 5-11 4-13-1-2-5 2-9 4-11-1 4 0 5 1 5-1-5 4-6 3-10Z"/>,
    food: <><path d="M4 3v6c0 3 6 3 6 0V3M7 3v19M18 22V3c-5 2-5 10 0 10"/></>,
    store: <><path d="M3 9 5 3h14l2 6M4 10v11h16V10M9 21v-7h6v7"/><path d="M3 9c0 4 5 4 5 0 0 4 8 4 8 0 0 4 5 4 5 0"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
    heart: <path d="M12 21 3 12C-3 4 7-1 12 6 17-1 27 4 21 12Z"/>,
    bike: <><circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-9 5 9h4L16 5h-3M8 8h5"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.food}</svg>;
}
