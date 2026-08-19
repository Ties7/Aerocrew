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