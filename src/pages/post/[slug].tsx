import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Image from 'next/image';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const content = post.data.content.map(item => {
    return {
      heading: item.heading,
      body: item.body
        .map(i => i.text.replace(/^\n/g, '').replace(/\n$/g, '').split('\n\n'))
        .flat(2),
    };
  });

  const words = content
    .map(item => item.body)
    .flat(2)
    .join(' ')
    .split(' ').length;
  const readTime = Math.ceil(words / 200);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <main className={styles.mainPost}>
      <div className={styles.logoDiv}>
        <img
          src="/img/banner.png"
          alt="logo"
          className={styles.logo}
        />
      </div>
      <div className={commonStyles.container}>
        <div className={styles.header}>
          <h1>{post.data.title}</h1>
          <div>
            <div className={styles.icons}>
              <FiCalendar />
              <p>
                {format(new Date(post.first_publication_date), 'd MMM y', {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className={styles.icons}>
              <FiUser />
              <p>{post.data.author}</p>
            </div>

            <div className={styles.icons}>
              <FiClock />
              <p>{readTime} min</p>
            </div>
          </div>
        </div>
        <div className={styles.content}>
          {content.map(p => {
            return (
              <div key={p.heading} className={styles.block}>
                <h2>{p.heading}</h2>
                {p.body.map((item, index) => {
                  return <p key={index}>{item}</p>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 5,
  });

  const staticPaths = posts.results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths: [...staticPaths],
    fallback: true, // false or 'blocking'
  };
};

export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', slug);
  const post = {
    ...response,
  };

  return {
    props: { post },
  };
};
