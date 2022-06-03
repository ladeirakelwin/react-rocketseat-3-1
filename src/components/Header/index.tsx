import styles from './header.module.scss';
import Image from 'next/image';
import Link from 'next/link'

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <a href="">
          <Image src="/img/logo.svg" width="240px" height="24px" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
