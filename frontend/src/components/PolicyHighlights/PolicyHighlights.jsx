import React from 'react';
import './PolicyHighlights.css';

const policies = [
    ['Easy Exchange Policy', 'Hassle-free exchanges for a smoother shopping experience.'],
    ['7 Days Return Policy', 'Free returns within 7 days on eligible products.'],
    ['Best Customer Support', 'Our support team is here whenever you need help.'],
];

export default function PolicyHighlights() {
    return <section className="policy-highlights" aria-label="Store policies">
        {policies.map(([title, text]) => <article key={title}><span className="policy-icon">+</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
    </section>;
}
