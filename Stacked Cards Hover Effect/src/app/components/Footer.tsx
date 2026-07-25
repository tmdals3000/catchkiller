import instagramWordmark from '../../assets/instagram-wordmark.svg';

export default function Footer() {
  return (
    <footer className="pt-24 pb-10 px-4 bg-gray-50">
      <div className="flex items-end justify-between max-w-5xl w-full mx-auto text-xs text-gray-500">
        <div className="flex flex-col gap-2">
          <p>© 2026 세종극회</p>
          <p>SINCE 1979</p>
        </div>

        <a
          href="https://www.instagram.com/catch_killer_26/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:opacity-70 transition-opacity"
        >
          <img src={instagramWordmark} alt="Instagram" className="h-6 w-auto" />
        </a>
      </div>
    </footer>
  );
}
