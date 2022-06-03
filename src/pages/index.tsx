import { GetStaticProps } from 'next';
import Header from '../components/Header';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface ReturnNextPage {
  page: number;
  results_per_page: number;
  results_size: number;
  total_results_size: number;
  total_pages: number;
  next_page: string | null;
  prev_page: string | null;
  results: Post[];
  version: string;
  license: string;
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );
  const [newResults, setNewResults] = useState(postsPagination.results);
  async function loadPost() {
    if (nextPage) {
      const response = await fetch(nextPage);
      const data = (await response.json()) as ReturnNextPage;
      setNewResults([...newResults, ...data.results]);
      setNextPage(data.next_page);
    }
  }

  return (
    <div className={commonStyles.container}>
      <Header />

      <div className={styles.content}>
        <main>
          <div className={styles.elementList}>
            {newResults.map(result => {
              return (
                <Link href={`/post/${result.uid}`} key={result.uid}>
                  <a href="">
                    <h2>{result.data.title}</h2>
                    <h3>{result.data.subtitle}</h3>
                    <div>
                      <div className={styles.icons}>
                        <FiCalendar />
                        <p>
                          {format(
                            new Date(result.first_publication_date),
                            'd MMM y',
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                      <div className={styles.icons}>
                        <FiUser />
                        <p>{result.data.author}</p>
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
          {nextPage && (
            <button onClick={() => loadPost()}>Carregar mais posts</button>
          )}
        </main>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({}) => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 5,
  });
  console.log(postsResponse.next_page);

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: { postsPagination },
  };
};
