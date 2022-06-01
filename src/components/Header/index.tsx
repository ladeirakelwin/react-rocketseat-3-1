import styles from './header.module.scss';
import Image from 'next/image'
export default function Header() {
  return (
    <header className={styles.header}>
          <Image src="/img/logo.svg" width="240px" height="24px" alt="logo"/>
    </header>
  );
}
