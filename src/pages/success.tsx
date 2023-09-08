import Link from "next/link";
import { ImageContainer, SuccessContainer } from "../styles/pages/success";
import { GetServerSideProps } from "next";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import Image from "next/image";
import Head from "next/head";

interface SuccessProps {
  customerName: string
  product: {
    name: string
    imageUrl: string
  }
}

export default function Success({customerName, product}: SuccessProps) {

  return (

    <>
    <Head>
      <title>Success | Ignite Shop</title>

      <meta name="robots" content="noindex"/>
    </Head>

    
    <SuccessContainer>
      <h1>Compra efetuada</h1>

      <ImageContainer>
        <Image src={product.imageUrl} alt="" width={120} height={110} />
      </ImageContainer>

      <p>
        Uhuul <strong>{customerName}</strong>, sua <strong>{product.name}</strong> já está a caminho de sua casa
      </p>

      <Link href="/">
        Voltar ao catálogo
      </Link>
    </SuccessContainer>
  </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }
  
  const sessionId = String(query.session_id)
  
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product']  
    // Além de puxar os dados da compra, expandimos para os produtos em si usando o 'expand'.
    // Com 'line_items' trazemos dados da compra e com o segundo parâmetro buscamos o produto em si baseado no seu preço
  })

  const customerName = session.customer_details.name

  const product = session.line_items.data[0].price.product as Stripe.Product
  // Aqui pegamos com o '[0]' apenas o primeiro item do array de itens pois por hora não temos um carrinho

  return {
    props: {
      customerName,
      product: {
        name: product.name,
        imageUrl: product.images[0]
      }
    }
  }
}


// Client-side (useEffect) | getServerSide | getStaticSide

// getStatic não faz sentido pois temos valores dinâmicos na URL da rota 
// Client-side não faz sentido pois trazemos pro front a nossa SECRET_KEY