import { getSalesChannelToken } from "@commercelayer/js-auth"
import { NextPage } from "next"
import dynamic from "next/dynamic"

import CheckoutSkeleton from "components/composite/CheckoutSkeleton"
import { useSettingsOrInvalid } from "components/hooks/useSettingsOrInvalid"
// Little necessary change
const getToken = async (market?: string) => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT as string
  const scope = market || (process.env.NEXT_PUBLIC_MARKET_ID as string)

  const data = await getSalesChannelToken({
    clientId,
    endpoint,
    scope,
  })
  return data?.accessToken as string
}

const DynamicCheckoutContainer = dynamic(
  () => import("components/composite/CheckoutContainer"),
  {
    loading: function LoadingSkeleton() {
      return <CheckoutSkeleton />
    },
  }
)

const DynamicCheckout = dynamic(() => import("components/composite/Checkout"), {
  loading: function LoadingSkeleton() {
    return <CheckoutSkeleton />
  },
})

interface AccessToken {
  accessToken: string
}

CheckoutSkeleton.displayName = "Skeleton Loader"
const Home: NextPage<AccessToken> = ({ accessToken }) => {
  const { settings, isLoading } = useSettingsOrInvalid(accessToken)

  if (isLoading || !settings) return <CheckoutSkeleton />

  return (
    <DynamicCheckoutContainer settings={settings}>
      <DynamicCheckout
        logoUrl={settings.logoUrl}
        orderNumber={settings.orderNumber}
        companyName={settings.companyName}
        supportEmail={settings.supportEmail}
        supportPhone={settings.supportPhone}
        termsUrl={settings.termsUrl}
        privacyUrl={settings.privacyUrl}
      />
    </DynamicCheckoutContainer>
  )
}

Home.getInitialProps = async () => {
  const accessToken = await getToken()
  return { accessToken }
}

export default Home
