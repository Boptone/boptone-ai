/**
 * Terms of Service Additions (February 2026)
 * 
 * This component contains legal additions for:
 * - Section 20: Shipping and Fulfillment Services
 * - Section 21: Search Engine Optimization and Content Indexing
 * - Section 22: AI Agent Integration and Third-Party Access
 * 
 * These sections address new features implemented in February 2026.
 */

export function TOSAdditions2026() {
  return (
    <>
      {/* Section 20: Shipping and Fulfillment Services */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">20. Shipping and Fulfillment Services</h2>
        
        <h3 className="text-2xl font-semibold mb-4">20.1 Shipping Services Overview</h3>
        <p className="mb-6">
          Boptone provides shipping and fulfillment services for physical products sold through the BopShop e-commerce platform. 
          Shipping services are provided through Shippo, a third-party shipping aggregator, which facilitates access to multiple 
          carriers including the United States Postal Service (USPS), FedEx, United Parcel Service (UPS), DHL, and other carriers 
          (collectively, "Carriers"). By using the shipping services, you agree to be bound by the terms of this Section 20 in 
          addition to all other provisions of these Terms.
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.2 Seller Responsibilities</h3>
        <p className="mb-4">
          If you are a seller using Boptone's shipping services to fulfill orders, you agree to the following responsibilities:
        </p>
        <div className="mb-6 space-y-4">
          <div>
            <strong>Product Information Accuracy:</strong> You are solely responsible for providing accurate product information, 
            including but not limited to product weight, dimensions, packaging requirements, and any special handling instructions. 
            Inaccurate product information may result in incorrect shipping rates, delivery delays, or carrier refusal to transport 
            the package.
          </div>
          <div>
            <strong>Packaging Standards:</strong> You must package all products securely and appropriately to withstand normal 
            shipping conditions. You are responsible for ensuring that products are properly protected against damage during transit. 
            Boptone is not liable for damage to products that result from inadequate packaging.
          </div>
          <div>
            <strong>Prohibited Items:</strong> You may not ship any items that are prohibited by law or by the Carriers' terms of 
            service, including but not limited to hazardous materials, illegal substances, weapons, explosives, flammable materials, 
            perishable goods without proper packaging, live animals, or items that violate intellectual property rights. Shipping 
            prohibited items may result in immediate account suspension, legal liability, and reporting to law enforcement authorities.
          </div>
          <div>
            <strong>Compliance with Laws:</strong> You are responsible for compliance with all applicable laws and regulations 
            governing the shipment of your products, including but not limited to export control laws, customs regulations, trade 
            sanctions, and product safety standards. For international shipments, you must provide accurate customs declarations and 
            are responsible for all customs duties, taxes, and fees.
          </div>
          <div>
            <strong>Timely Fulfillment:</strong> You agree to ship orders within the timeframe specified in your product listings or, 
            if no timeframe is specified, within three (3) business days of receiving the order. Failure to ship orders in a timely 
            manner may result in customer complaints, refund requests, and account penalties.
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4">20.3 Buyer Responsibilities</h3>
        <p className="mb-4">
          If you are a buyer purchasing products through BopShop, you agree to the following responsibilities:
        </p>
        <div className="mb-6 space-y-4">
          <div>
            <strong>Address Accuracy:</strong> You are solely responsible for providing a complete and accurate shipping address, 
            including recipient name, street address, city, state/province, postal code, and country. Boptone provides address 
            validation as a courtesy, but validation does not guarantee successful delivery. You acknowledge that Boptone, sellers, 
            and Carriers are not liable for packages delivered to an incorrect address due to your error.
          </div>
          <div>
            <strong>Availability for Delivery:</strong> You are responsible for being available to receive packages or arranging for 
            someone to receive packages on your behalf. If a package requires a signature and no one is available to sign, the Carrier 
            may attempt redelivery or hold the package at a local facility for pickup. Boptone is not responsible for packages returned 
            to the seller due to failed delivery attempts.
          </div>
          <div>
            <strong>Inspection Upon Delivery:</strong> You agree to inspect packages upon delivery and report any visible damage to 
            the Carrier immediately. Failure to report damage at the time of delivery may affect your ability to file a claim for 
            damaged goods.
          </div>
          <div>
            <strong>Customs Duties and Taxes:</strong> For international orders, you are responsible for all customs duties, taxes, 
            import fees, and any other charges imposed by your country's customs authority. These charges are not included in the 
            shipping cost and are your sole responsibility. Refusal to pay customs charges may result in the package being returned 
            to the seller or destroyed by customs, and you will not be entitled to a refund.
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4">20.4 Shipping Rates and Charges</h3>
        <p className="mb-6">
          Shipping rates are calculated in real-time based on package weight, dimensions, origin address, destination address, 
          selected shipping method, and current Carrier rates. Shipping rates displayed at checkout are estimates and may be subject 
          to adjustment if the actual package weight or dimensions differ from the information provided by the seller. Sellers may 
          choose to offer free shipping, flat-rate shipping, or real-time carrier-calculated shipping. Shipping charges are separate 
          from product prices and are non-refundable except as provided in Section 20.8 (Refunds and Returns). Boptone reserves the 
          right to charge additional fees for special handling, oversized packages, remote area delivery, or other circumstances that 
          result in additional costs.
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.5 Shipping Methods and Delivery Times</h3>
        <p className="mb-4">
          Delivery times are estimates provided by the Carriers and are not guaranteed by Boptone or sellers. Actual delivery times 
          may vary due to factors beyond our control, including but not limited to weather conditions, natural disasters, carrier 
          delays, customs processing, holidays, pandemics, labor strikes, transportation disruptions, and other force majeure events.
        </p>
        <p className="mb-4">Boptone offers the following shipping methods (availability may vary by destination):</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li><strong>Standard Shipping:</strong> Estimated delivery in 5-7 business days (USPS Ground, FedEx Ground, UPS Ground)</li>
          <li><strong>Expedited Shipping:</strong> Estimated delivery in 2-3 business days (USPS Priority Mail, FedEx 2Day, UPS 2nd Day Air)</li>
          <li><strong>Express Shipping:</strong> Estimated delivery in 1-2 business days (USPS Priority Mail Express, FedEx Overnight, UPS Next Day Air)</li>
          <li><strong>International Shipping:</strong> Estimated delivery in 7-21 business days (varies by destination)</li>
        </ul>
        <p className="mb-6">
          Delivery time estimates begin from the date of shipment, not the date of order placement. Boptone and sellers are not 
          liable for delivery delays caused by Carriers or circumstances beyond our control.
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.6 Tracking and Delivery Confirmation</h3>
        <p className="mb-6">
          All shipments include tracking numbers that allow you to monitor the status of your package. Tracking information is 
          provided by the Carriers and is updated as the package moves through the shipping network. Tracking information may be 
          delayed or incomplete due to Carrier system issues. For orders shipped via methods that include delivery confirmation, 
          the Carrier's delivery confirmation serves as proof of delivery. Boptone and sellers are not responsible for packages 
          marked as "delivered" by the Carrier, even if you did not receive the package. In such cases, you should contact the 
          Carrier directly to file a claim or investigate the delivery.
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.7 Lost, Damaged, or Stolen Packages</h3>
        <p className="mb-4">
          <strong>Liability Limitation:</strong> Boptone is not liable for packages that are lost, damaged, stolen, or delayed 
          during transit. Liability for lost or damaged packages rests with the Carrier or, in some cases, the seller. Boptone 
          acts solely as a facilitator of shipping services and does not assume responsibility for Carrier performance.
        </p>
        <p className="mb-4">
          <strong>Filing Claims:</strong> If your package is lost or damaged during transit, you must file a claim with the Carrier 
          within the timeframe specified by the Carrier's terms of service (typically 60 days from the ship date). Boptone and 
          sellers will reasonably cooperate with claim investigations by providing necessary documentation, but we do not guarantee 
          that claims will be approved or that you will receive compensation.
        </p>
        <p className="mb-4">
          <strong>Stolen Packages:</strong> Boptone and sellers are not responsible for packages stolen after delivery. If a package 
          is marked as "delivered" by the Carrier but you did not receive it, you should:
        </p>
        <ol className="list-decimal list-inside mb-4 space-y-2">
          <li>Check with neighbors, household members, or building management</li>
          <li>Verify the delivery address on your order</li>
          <li>Contact the Carrier to investigate the delivery</li>
          <li>File a police report if you believe the package was stolen</li>
          <li>Contact the seller to request assistance</li>
        </ol>
        <p className="mb-6">
          Sellers may, at their sole discretion, offer replacements or refunds for stolen packages, but they are not obligated to 
          do so. <strong>Insurance:</strong> Sellers may purchase shipping insurance to protect against loss or damage. Insurance 
          coverage is optional and is the seller's responsibility. Buyers should contact sellers directly to inquire about insurance 
          coverage for high-value items.
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.8 Returns and Refunds</h3>
        <p className="mb-4">
          Return and refund policies are set by individual sellers and must be clearly disclosed on product pages. Boptone does not 
          impose a universal return policy but requires sellers to honor the return policies they publish.
        </p>
        <p className="mb-4">
          <strong>Return Shipping Costs:</strong> Unless the product is defective, damaged during shipping, or not as described, the 
          buyer is responsible for return shipping costs. Sellers may provide prepaid return labels at their discretion.
        </p>
        <p className="mb-4">
          <strong>Refund of Shipping Charges:</strong> Original shipping charges are non-refundable unless the seller failed to ship 
          the product, the product was defective or damaged during shipping, or the product was not as described. Expedited or express 
          shipping upgrades are non-refundable in all circumstances.
        </p>
        <p className="mb-6">
          <strong>Restocking Fees:</strong> Sellers may charge restocking fees for returned items, provided such fees are disclosed 
          in the product listing or seller's return policy. Restocking fees typically range from 10% to 20% of the product price.
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.9 International Shipping</h3>
        <p className="mb-4">
          <strong>Customs and Duties:</strong> International shipments are subject to customs inspection and may be subject to customs 
          duties, taxes, import fees, and other charges imposed by the destination country. These charges are the buyer's sole 
          responsibility and are not included in the product price or shipping cost. Boptone and sellers have no control over these 
          charges and cannot predict their amount.
        </p>
        <p className="mb-4">
          <strong>Customs Declarations:</strong> Sellers are responsible for providing accurate customs declarations, including product 
          descriptions, values, and country of origin. Providing false or misleading customs information is illegal and may result in 
          account termination and legal consequences.
        </p>
        <p className="mb-4">
          <strong>Customs Delays and Rejections:</strong> Packages may be delayed or rejected by customs authorities for various reasons, 
          including incomplete documentation, prohibited items, or failure to pay customs charges. Boptone and sellers are not responsible 
          for customs delays or rejections. If a package is returned to the seller due to customs issues, the buyer may not be entitled 
          to a refund.
        </p>
        <p className="mb-6">
          <strong>Export Restrictions:</strong> Certain products may be subject to export restrictions or prohibitions. Sellers are 
          responsible for ensuring compliance with all applicable export control laws. Buyers are responsible for ensuring that products 
          can be legally imported into their country.
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.10 Third-Party Shipping Services</h3>
        <p className="mb-4">
          Boptone uses Shippo as a third-party shipping aggregator to facilitate access to Carriers. By using the shipping services, 
          you acknowledge and agree that:
        </p>
        <ol className="list-decimal list-inside mb-4 space-y-2">
          <li>Shippo and the Carriers are independent third parties and are not agents, employees, or representatives of Boptone.</li>
          <li>Your use of Shippo and Carrier services is subject to their respective terms of service and privacy policies.</li>
          <li>Boptone is not responsible for the acts, omissions, or policies of Shippo or the Carriers.</li>
          <li>Shippo and the Carriers may collect and use your information (including shipping addresses) in accordance with their own privacy policies.</li>
          <li>Boptone makes no warranties regarding the performance, reliability, or availability of Shippo or Carrier services.</li>
        </ol>
        <p className="mb-6">
          Shippo's Privacy Policy: <a href="https://goshippo.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://goshippo.com/privacy</a><br />
          Shippo's Terms of Service: <a href="https://goshippo.com/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://goshippo.com/terms</a>
        </p>

        <h3 className="text-2xl font-semibold mb-4">20.11 Limitation of Liability for Shipping Services</h3>
        <p className="mb-6 font-semibold uppercase">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, BOPTONE'S TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO SHIPPING 
          SERVICES SHALL NOT EXCEED THE SHIPPING CHARGES PAID FOR THE SPECIFIC SHIPMENT GIVING RISE TO THE CLAIM. BOPTONE IS NOT 
          LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO SHIPPING 
          SERVICES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST REVENUE, LOST DATA, OR BUSINESS INTERRUPTION.
        </p>
      </section>

      {/* Section 21: Search Engine Optimization and Content Indexing */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">21. Search Engine Optimization and Content Indexing</h2>
        
        <h3 className="text-2xl font-semibold mb-4">21.1 Structured Data and SEO Services</h3>
        <p className="mb-4">
          Boptone automatically generates structured data, meta tags, sitemaps, and other search engine optimization (SEO) and 
          generative engine optimization (GEO) content to improve the discoverability of artist profiles, product listings, and 
          other content on the Service. This includes but is not limited to:
        </p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>JSON-LD structured data using schema.org vocabularies (MusicGroup, Product, Store, BreadcrumbList, and other schemas)</li>
          <li>Meta tags for social media platforms (Open Graph, Twitter Cards)</li>
          <li>Dynamic sitemaps (sitemap.xml) for search engine crawlers</li>
          <li>Breadcrumb navigation with structured data</li>
          <li>GEO-optimized content designed for citation by large language models (LLMs) and AI assistants</li>
        </ul>
        <p className="mb-6">
          By using the Service and creating content, you acknowledge and agree that Boptone may generate and publish structured data 
          derived from your content for the purpose of improving discoverability.
        </p>

        <h3 className="text-2xl font-semibold mb-4">21.2 Search Engine and LLM Indexing</h3>
        <p className="mb-4">
          Your publicly accessible content on Boptone, including artist profiles, product listings, and other information you choose 
          to make public, may be indexed by search engines (such as Google, Bing, DuckDuckGo, and others) and large language models 
          (such as ChatGPT, Claude, Perplexity, and others). This indexing is a standard practice on the internet and is necessary 
          for users to discover your content through search engines and AI assistants.
        </p>
        <p className="mb-6">You acknowledge and agree that:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>Boptone does not control how search engines or LLMs index, display, or cite your content.</li>
          <li>Search engines and LLMs may cache, summarize, or excerpt your content in search results or AI-generated responses.</li>
          <li>Boptone is not responsible for the accuracy, completeness, or context of how your content is presented by third-party search engines or LLMs.</li>
          <li>You retain all ownership rights to your content, but you grant search engines and LLMs the right to index and display your publicly accessible content in accordance with their terms of service.</li>
        </ol>

        <h3 className="text-2xl font-semibold mb-4">21.3 Opt-Out from Search Engine Indexing</h3>
        <p className="mb-6">
          If you do not want your content to be indexed by search engines or LLMs, you may set your artist profile or product listings 
          to "private" or "unlisted" in your account settings. Private content is not included in sitemaps and is not accessible to 
          search engine crawlers. However, Boptone cannot guarantee that search engines or LLMs will not index content that was 
          previously public or that was shared through other means (such as social media links or direct URLs).
        </p>

        <h3 className="text-2xl font-semibold mb-4">21.4 Accuracy of Generated Content</h3>
        <p className="mb-6">
          Boptone uses automated systems to generate structured data and GEO-optimized content based on the information you provide. 
          While we strive for accuracy, we do not guarantee that generated content is error-free or complete. You are responsible for 
          reviewing and correcting any inaccuracies in your profile or product listings. Boptone is not liable for any damages arising 
          from inaccurate or incomplete structured data or SEO/GEO content.
        </p>

        <h3 className="text-2xl font-semibold mb-4">21.5 Third-Party Citation and Attribution</h3>
        <p className="mb-6">
          When your content is cited by LLMs or AI assistants, attribution practices vary by platform. Some LLMs may cite Boptone as 
          the source, while others may cite you directly or provide no attribution. Boptone does not control third-party attribution 
          practices and is not responsible for ensuring that you receive proper credit when your content is cited by LLMs or AI assistants.
        </p>
      </section>

      {/* Section 22: AI Agent Integration and Third-Party Access */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">22. AI Agent Integration and Third-Party Access</h2>
        
        <h3 className="text-2xl font-semibold mb-4">22.1 Agent API Overview</h3>
        <p className="mb-6">
          Boptone provides an Application Programming Interface (API) that allows third-party artificial intelligence (AI) agents, 
          chatbots, and automated systems (collectively, "AI Agents") to access certain features of the Service on behalf of users. 
          The Agent API enables AI Agents to search for artists and products, retrieve information, and, with proper user authorization, 
          initiate purchases and other transactions. By authorizing an AI Agent to access your account, you agree to be bound by the 
          terms of this Section 22 in addition to all other provisions of these Terms.
        </p>

        <h3 className="text-2xl font-semibold mb-4">22.2 User Authorization and OAuth</h3>
        <p className="mb-6">
          AI Agents must obtain your explicit authorization before accessing your Boptone account or performing actions on your behalf. 
          Authorization is granted through OAuth 2.0, an industry-standard authorization protocol. When you authorize an AI Agent, you 
          grant it specific permissions (scopes) that define what actions the AI Agent can perform. You may revoke authorization at any 
          time through your account settings. Boptone is not responsible for actions taken by AI Agents that you have authorized, even 
          if those actions were unintended or resulted from miscommunication with the AI Agent.
        </p>

        <h3 className="text-2xl font-semibold mb-4">22.3 AI Agent Responsibilities</h3>
        <p className="mb-4">
          Developers and operators of AI Agents that access the Boptone Agent API agree to the following responsibilities:
        </p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li><strong>Compliance with API Terms:</strong> AI Agents must comply with the Boptone Agent API Terms of Service and Developer Guidelines.</li>
          <li><strong>User Consent:</strong> AI Agents must obtain explicit user consent before performing any action that affects the user's account, including purchases, profile updates, or data access.</li>
          <li><strong>Transparency:</strong> AI Agents must clearly identify themselves as automated systems and disclose their capabilities and limitations to users.</li>
          <li><strong>Data Security:</strong> AI Agents must implement appropriate security measures to protect user data and API credentials.</li>
          <li><strong>Rate Limiting:</strong> AI Agents must respect rate limits imposed by the Agent API and must not attempt to circumvent or abuse rate limits.</li>
          <li><strong>No Malicious Use:</strong> AI Agents must not be used for malicious purposes, including but not limited to fraud, spam, data scraping, denial-of-service attacks, or unauthorized access to user accounts.</li>
        </ol>

        <h3 className="text-2xl font-semibold mb-4">22.4 Purchases Initiated by AI Agents</h3>
        <p className="mb-6">
          AI Agents may initiate purchases on your behalf if you have granted them the appropriate authorization. When an AI Agent 
          initiates a purchase, you are responsible for the transaction as if you had initiated it yourself. You acknowledge and agree 
          that Boptone is not responsible for purchases initiated by AI Agents, even if the purchase was unintended or resulted from 
          miscommunication with the AI Agent. All purchases initiated by AI Agents are subject to the same terms and conditions as 
          purchases initiated directly by users, including payment obligations, shipping terms, and refund policies.
        </p>

        <h3 className="text-2xl font-semibold mb-4">22.5 Data Sharing with AI Agents</h3>
        <p className="mb-4">
          When you authorize an AI Agent to access your Boptone account, the AI Agent may receive access to certain information about 
          you, including but not limited to:
        </p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Your name, email address, and profile information</li>
          <li>Your purchase history and order details</li>
          <li>Your shipping addresses and payment methods</li>
          <li>Your artist profile and product listings (if you are a seller)</li>
          <li>Your browsing history and preferences on Boptone</li>
        </ul>
        <p className="mb-6">
          The specific information shared with an AI Agent depends on the permissions (scopes) you grant during the authorization process. 
          AI Agents are independent third parties and are not controlled by Boptone. Boptone is not responsible for how AI Agents use, 
          store, or share your information. You should review the privacy policy of any AI Agent before granting authorization.
        </p>

        <h3 className="text-2xl font-semibold mb-4">22.6 Revoking AI Agent Access</h3>
        <p className="mb-6">
          You may revoke an AI Agent's access to your Boptone account at any time through your account settings. Revoking access will 
          immediately terminate the AI Agent's ability to access your account or perform actions on your behalf. However, revoking access 
          does not undo actions that the AI Agent has already performed, such as completed purchases or profile updates. Boptone is not 
          responsible for any consequences of revoking AI Agent access, including but not limited to disruption of services provided by 
          the AI Agent.
        </p>

        <h3 className="text-2xl font-semibold mb-4">22.7 Rate Limiting and API Abuse</h3>
        <p className="mb-6">
          The Boptone Agent API is subject to rate limits to ensure fair use and prevent abuse. AI Agents that exceed rate limits may 
          be temporarily or permanently blocked from accessing the API. Boptone reserves the right to suspend or terminate API access 
          for AI Agents that engage in abusive behavior, including but not limited to excessive API requests, data scraping, spam, fraud, 
          or attempts to circumvent security measures.
        </p>

        <h3 className="text-2xl font-semibold mb-4">22.8 Limitation of Liability for AI Agent Actions</h3>
        <p className="mb-6 font-semibold uppercase">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, BOPTONE IS NOT LIABLE FOR ANY DAMAGES ARISING OUT OF OR RELATING TO ACTIONS TAKEN BY 
          AI AGENTS ON YOUR BEHALF, INCLUDING BUT NOT LIMITED TO UNINTENDED PURCHASES, DATA BREACHES, MISCOMMUNICATION, OR OTHER ERRORS. 
          YOU ACKNOWLEDGE THAT AI AGENTS ARE THIRD-PARTY SERVICES AND THAT BOPTONE DOES NOT CONTROL OR ENDORSE ANY AI AGENT. YOUR USE OF 
          AI AGENTS IS AT YOUR OWN RISK.
        </p>
      </section>
    </>
  );
}
