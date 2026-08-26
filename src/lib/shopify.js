const domain = import.meta.env.PUBLIC_SHOPIFY_DOMAIN;
const token = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const endpoint = `https://${domain}/api/2025-01/graphql.json`;

async function shopifyFetch(query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API fout: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  // fout in geparsede json of graphql fout in heeft gestopt (wel ontvangen maar wel fout in json)
  if (json.errors) {
    throw new Error(`Shopify GraphQL fout: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

export async function getAllProducts() {
  const query = `
    query {
      products(first: 10) {
        nodes {
          id
          handle
          title
          description
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 10) {
            nodes { id title availableForSale price { amount currencyCode } }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query);
  return data.products.nodes;
}

export async function createCart(merchandiseId, quantity = 1) {
  // kondigt aan: deze schrijfactie heeft een lijst met cart regels nodig, genaamd $lines
  // roept Shopify's cart aanmaak actie aan, met $lines als de input
  const query = `
    mutation CreateCart($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { lines: [{ merchandiseId, quantity }] });
  const { cart, userErrors } = data.cartCreate;

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(', '));
  }

  return cart;
}

export async function addCartLine(cartId, merchandiseId, quantity = 1) {
  const query = `
    mutation AddCartLine($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { cartId, lines: [{ merchandiseId, quantity }] });
  const { cart, userErrors } = data.cartLinesAdd;

  const cartdontexist = userErrors.some((e) => e.message.includes('cart does not exist'));

  if (cartdontexist) {
    return createCart(merchandiseId, quantity);
  }

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(', '));
  }

  return cart;
}

export async function getCart(cartId) {
  const query = `
    query GetCart($id: ID!) {
      cart(id: $id) {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                image { url altText }
                price { amount currencyCode }
                product {
                  title
                  handle
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { id: cartId });
  return data.cart;
}

export async function updateCartLine(cartId, lineId, quantity) {
  const query = `
    mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { cartId, lines: [{ id: lineId, quantity }] });
  const { cart, userErrors } = data.cartLinesUpdate;

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(', '));
  }

  return cart;
}

export async function removeCartLine(cartId, lineId) {
  const query = `
    mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { cartId, lineIds: [lineId] });
  const { cart, userErrors } = data.cartLinesRemove;

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(', '));
  }

  return cart;
}