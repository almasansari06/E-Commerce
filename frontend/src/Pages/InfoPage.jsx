import React from 'react';
import './CSS/InfoPage.css';

const content = {
    about: {
        eyebrow: 'ABOUT SHOPPER',
        title: 'Thoughtful essentials for everyday style.',
        text: 'SHOPPER brings considered fashion basics and seasonal pieces together in one easy-to-browse collection.',
        sections: [['Our approach', 'We focus on wearable design, clear product information, and a shopping experience that stays simple from discovery to delivery.'], ['Made for everyone', 'Explore men, women, and kids collections with filters that make finding the right product faster.'], ['Quality first', 'Every product is presented with transparent pricing, clear categories, and the details you need before you buy.'], ['A simpler wardrobe', 'Discover new arrivals, bestsellers, and considered essentials without the noise of a crowded storefront.']],
    },
    contact: {
        eyebrow: 'CONTACT',
        title: 'We are here to help.',
        text: 'Have a question about an order, product, or delivery? Send us a message and our team will get back to you.',
        sections: [['Email', 'support@shopper.local'], ['Hours', 'Monday to Friday, 9:00 AM to 6:00 PM'], ['Order support', 'Include your order date and email address so we can find your order quickly.'], ['Product questions', 'Ask us about sizing, availability, delivery, or returns before placing your order.']],
    },
    returns: {
        eyebrow: 'DELIVERY & RETURNS',
        title: 'Straightforward delivery and returns.',
        text: 'Orders are prepared after confirmation and delivered to the address provided during checkout.',
        sections: [['Returns', 'Contact support within 7 days of delivery with your order ID. Items should be unused and in their original condition.'], ['Delivery', 'Shipping is currently free on all orders in the checkout flow.'], ['Order updates', 'Track your order status from the Orders page after signing in. Status begins at Processing and is updated as your order moves forward.'], ['Exchange help', 'For an exchange, contact support with the product name, order ID, and the reason for your request.']],
    },
    privacy: {
        eyebrow: 'PRIVACY POLICY',
        title: 'Your information stays yours.',
        text: 'We use account, address, and order information only to provide the shopping service and support your orders.',
        sections: [['What we store', 'Account details, address, cart information, and order history are stored to support your customer experience.'], ['Why we use it', 'We use this information to authenticate your account, process orders, deliver products, and answer support requests.'], ['Your control', 'Contact support to request an update or deletion of your account information.'], ['Secure handling', 'Never share your password or database credentials. We will never ask for your password by email.']],
    },
};

export default function InfoPage({ type }) {
    const page = content[type];
    return <main className="info-page">
        <p className="info-eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="info-lead">{page.text}</p>
        <div className="info-sections">{page.sections.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}</div>
    </main>;
}
