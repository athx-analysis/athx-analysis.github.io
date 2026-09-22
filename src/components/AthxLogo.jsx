// Wordmark ATHX officiel, extrait tel quel du bundle JS du site
// athxgames.com (composant Vue `AthxLogo`, cf. build/assets/AthxLogo-*.js).
// Même tracé vectoriel, juste porté en React avec une prop `color`.
export default function AthxLogo({ color = '#ffffff', className, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="19.898 292.924 3311.212 656.724"
      fill={color}
      className={className}
      style={style}
    >
      <path d="M322.401 292.924L19.8984 949.648H301.812L337.362 866.741H652.957L688.506 949.648H970.43L668.554 292.924H322.401ZM410.967 695.703L492.674 506.436H497.665L579.372 695.703H410.967Z" />
      <path d="M838.211 490.068H1083.33V949.648H1347.16V490.068H1592.28V292.924H838.211V490.068Z" />
      <path d="M2190.4 522.053H1900.38V292.924H1636.55V949.648H1900.38V713.329H2190.4V949.648H2454.22V292.924H2190.4V522.053Z" />
      <path d="M3303.1 292.924H2994.36L2900.8 436.545L2806.62 292.924H2497.88L2738.64 606.271L2469.82 949.648H2791.65L2900.75 785.145L3009.28 949.648H3331.11L3062.29 606.271L3303.1 292.924Z" />
    </svg>
  )
}
