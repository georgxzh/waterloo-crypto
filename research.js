/* Waterloo Crypto — research index.
   One data source feeds the landing-page index (#research-index) and the
   section pages (research.html#<slug>). Edit papers here only. */
(() => {
  const FACULTY = [
    { name: 'Sergey Gorbunov', url: 'https://cs.uwaterloo.ca/~sgorbuno/' },
    { name: 'Bernard Wong', url: 'https://cs.uwaterloo.ca/~bernard/' },
    { name: 'Raouf Boutaba', url: 'https://cs.uwaterloo.ca/~rboutaba/' },
  ];

  const SECTIONS = [
    {
      slug: 'cryptographic-foundations',
      title: 'Cryptographic Foundations',
      def: 'Lattice-based encryption, functional and attribute-based encryption, homomorphic signatures: the theory the rest of the stack rests on.',
      note: 'Start with Attribute-Based Encryption for Circuits, the most-cited paper across all three faculty profiles.',
      papers: [
        { title: 'Attribute-Based Encryption for Circuits', authors: 'Gorbunov, Vaikuntanathan, Wee', venue: 'STOC (journal version: Journal of the ACM 62(6), 2015)', year: '2013', tag: 'Anchor paper' },
        { title: 'Predicate Encryption for Circuits from LWE', authors: 'Gorbunov, Vaikuntanathan, Wee', venue: 'CRYPTO (invited to J. Cryptology)', year: '2015' },
        { title: 'Leveled Fully Homomorphic Signatures from Standard Lattices', authors: 'Gorbunov, Vaikuntanathan, Wichs', venue: 'STOC', year: '2015' },
        { title: 'Fully Key-Homomorphic Encryption, Arithmetic Circuit ABE and Compact Garbled Circuits', authors: 'Boneh, Gentry, Gorbunov, Halevi, Nikolaenko, Segev, Vaikuntanathan, Vinayagamurthy', venue: 'EUROCRYPT', year: '2014' },
        { title: 'Graph-Induced Multilinear Maps from Lattices', authors: 'Gentry, Gorbunov, Halevi', venue: 'TCC', year: '2015' },
        { title: 'Functional Encryption: New Perspectives and Lower Bounds', authors: 'Agrawal, Gorbunov, Vaikuntanathan, Wee', venue: 'CRYPTO', year: '2013' },
        { title: 'Functional Encryption with Bounded Collusions via Multi-Party Computation', authors: 'Gorbunov, Vaikuntanathan, Wee', venue: 'CRYPTO', year: '2012' },
        { title: 'Riding on Asymmetry: Efficient ABE for Branching Programs', authors: 'Gorbunov, Vinayagamurthy', venue: 'ASIACRYPT', year: '2015' },
      ],
    },
    {
      slug: 'privacy-encrypted-computation',
      title: 'Privacy-Preserving & Encrypted Computation',
      def: 'Running computation over data you are not allowed to see: trusted hardware, oblivious memory, encrypted databases, private set intersection.',
      note: 'Efficient Evaluation of Activation Functions over Encrypted Data is encrypted ML inference, and the bridge into the DeAI track.',
      papers: [
        { title: 'ZeroTrace: Oblivious Memory Primitives from Intel SGX', authors: 'Sasy, Gorbunov, Fletcher', venue: 'NDSS', year: '2018' },
        { title: 'Iron: Functional Encryption using Intel SGX', authors: 'Fisch, Vinayagamurthy, Boneh, Gorbunov', venue: 'CCS', year: '2017', tag: 'Best Paper Award Finalist' },
        { title: 'StealthDB: A Scalable Encrypted Database with Full SQL Query Support', authors: 'Gribov, Vinayagamurthy, Gorbunov', venue: 'PETS', year: '2019' },
        { title: 'Over-Threshold Multiparty Private Set Intersection for Collaborative Network Intrusion Detection', authors: 'Arpaci, Kerschbaum, Boutaba', venue: 'USENIX NSDI', year: '2026' },
        { title: 'Efficient Evaluation of Activation Functions over Encrypted Data', authors: 'Thaine, Gorbunov, Penn', venue: 'IEEE Deep Learning and Security Workshop', year: '2019', tag: 'DeAI bridge' },
      ],
    },
    {
      slug: 'consensus-replication',
      title: 'Consensus & Replication',
      def: 'Agreement protocols, and the systems engineering that makes them fast at scale.',
      note: 'Pixel sits between this track and Cryptographic Foundations: forward-secure multi-signatures designed for proof-of-stake consensus.',
      papers: [
        { title: 'Canopus: A Scalable and Massively Parallel Consensus Protocol', authors: 'Rizvi, Wong, Keshav', venue: 'CoNEXT', year: '2017', tag: 'Best Paper nominee' },
        { title: 'Sift: Resource-Efficient Consensus with RDMA', authors: 'Kazhamiaka, Memon, Kankanamge, Sahu, Rizvi, Wong, Daudjee', venue: 'CoNEXT', year: '2019' },
        { title: 'Domino: Using Network Measurements to Reduce State Machine Replication Latency in WANs', authors: 'Yan, Yang, Wong', venue: 'CoNEXT', year: '2020' },
        { title: 'Antipaxos: Taking Interactive Consistency to the Next Level', authors: 'Mao, Golab, Wong', venue: 'ICDCN 2022; J. Parallel & Distributed Computing 2024', year: '2022 / 2024' },
        { title: 'Kronos: The Design and Implementation of an Event Ordering Service', authors: 'Escriva, Dubey, Wong, Sirer', venue: 'EuroSys', year: '2014' },
        { title: 'Pixel: Multi-Signatures for Consensus', authors: 'Drijvers, Gorbunov, Neven, Wee', venue: 'USENIX Security', year: '2020' },
      ],
    },
    {
      slug: 'blockchain-cryptoeconomics',
      title: 'Blockchain Protocols & Cryptoeconomics',
      def: 'Ledger design itself: leader election, secret-keeping chains, monetary policy, proofs of sequential work.',
      note: 'Democoin, written with Silvio Micali in 2015, holds the initial designs that became Algorand.',
      papers: [
        { title: 'Can a Public Blockchain Keep a Secret?', authors: 'Benhamouda, Gentry, Gorbunov, Halevi, Krawczyk, Rabin, Reyzin', venue: 'TCC', year: '2020' },
        { title: 'Pointproofs: Aggregating Proofs for Multiple Vector Commitments', authors: 'Gorbunov, Reyzin, Wee, Zhang', venue: 'CCS', year: '2020' },
        { title: 'Democoin: A Publicly Verifiable and Jointly Serviced Cryptocurrency', authors: 'Gorbunov, Micali', venue: 'Manuscript / patent (initial designs for Algorand)', year: '2015', tag: 'Algorand pre-history' },
        { title: 'Elasticoin: Low-Volatility Cryptocurrency with Proofs of Sequential Work', authors: 'Dong, Boutaba', venue: 'IEEE ICBC', year: '2019' },
        { title: 'Melmint: Trustless Stable Cryptocurrency', authors: 'Dong, Boutaba', venue: 'Cryptoeconomic Systems (CryptoEconSys)', year: '2020' },
      ],
    },
    {
      slug: 'scaling-sharding-interop',
      title: 'Scaling, Sharding & Interoperability',
      def: 'Getting past single-chain throughput: cross-shard transactions, cross-chain message routing, high-contention transaction processing.',
      note: 'The 2026 cross-chain routing paper is the newest work in this space from any of the three faculty.',
      papers: [
        { title: 'Providing Cross-Chain Interoperability Through Decentralized Message Routing and Delivery', authors: 'Rezaei, Davidson, Wong', venue: 'ICDCS', year: '2026', tag: 'Newest' },
        { title: 'Toward Reducing Cross-Shard Transaction Overhead in Sharded Blockchains', authors: 'Ren, Ward, Wong', venue: 'DEBS', year: '2022', tag: 'Best Student Paper' },
        { title: 'Improving the Performance of Blockchain Sharding Protocols with Collaborative Transaction Verification', authors: 'Ren, Ward, Wong', venue: 'IEEE Blockchain', year: '2021' },
        { title: 'Carousel: Low-Latency Transaction Processing for Globally-Distributed Data', authors: 'Yan, Yang, Zhang, Lin, Wong, Salem, Brecht', venue: 'SIGMOD', year: '2018' },
        { title: 'Natto: Providing Distributed Transaction Prioritization for High-Contention Workloads', authors: 'Yang, Yan, Wong', venue: 'SIGMOD', year: '2022' },
      ],
    },
    {
      slug: 'infrastructure-naming-anonymity',
      title: 'Decentralized Infrastructure, Naming & Anonymity',
      def: 'Trust roots, naming, discovery and anonymous payment on decentralized substrates.',
      note: 'Astrape has four Waterloo authors (Dong, Goldberg, Gorbunov, Boutaba) and is anonymous payment channels at ACNS.',
      papers: [
        { title: 'Astrape: Anonymous Payment Channels with Boring Cryptography', authors: 'Dong, Goldberg, Gorbunov, Boutaba', venue: 'ACNS', year: '2022', tag: 'Featured' },
        { title: 'Conifer: Centrally-Managed PKI with Blockchain-Rooted Trust', authors: 'Dong, Kim, Boutaba', venue: 'IEEE Blockchain', year: '2018' },
        { title: 'Bitforest: A Portable and Efficient Blockchain-Based Naming System', authors: 'Dong, Kim, Boutaba', venue: 'CNSM', year: '2018' },
        { title: 'HyperDex: A Distributed, Searchable Key-Value Store', authors: 'Escriva, Wong, Sirer', venue: 'SIGCOMM', year: '2012' },
        { title: 'Blindfold: A System to "See No Evil" in Content Discovery', authors: 'Peterson, Wong, Sirer', venue: 'IPTPS', year: '2010' },
        { title: 'Quasar: A Probabilistic Publish-Subscribe System for Social Networks', authors: 'Wong, Guha', venue: 'IPTPS', year: '2008' },
        { title: 'Meridian: A Lightweight Network Location Service without Virtual Coordinates', authors: 'Wong, Slivkins, Sirer', venue: 'SIGCOMM', year: '2005' },
        { title: "Dude, Where's That IP? Circumventing Measurement-Based IP Geolocation", authors: 'Gill, Ganjali, Wong, Lie', venue: 'USENIX Security', year: '2010' },
      ],
    },
    {
      slug: 'post-quantum-standards',
      title: 'Post-Quantum & Standards',
      def: 'Standards drafts and white papers: specs the industry adopts, with Waterloo faculty among the authors.',
      note: 'These entries are standards drafts and white papers, so the venue column names the standards body or publisher.',
      papers: [
        { title: 'BLS Signature Scheme', authors: 'Gorbunov et al.', venue: 'IRTF CFRG draft (draft-irtf-cfrg-bls-signature)', year: 'Draft', url: 'https://datatracker.ietf.org/doc/draft-irtf-cfrg-bls-signature/' },
        { title: 'Homomorphic Encryption Standard', authors: 'Gorbunov et al.', venue: 'IACR ePrint 2019/939', year: '2019', url: 'https://eprint.iacr.org/2019/939' },
        { title: 'Quantum-Proofing the Blockchain', authors: 'Gheorghiu, Gorbunov, Mosca, Munson', venue: 'Blockchain Research Institute white paper', year: '2017' },
        { title: 'Mitigating Signaling Storms in 5G with Blockchain-assisted 5GAKA', authors: 'Zhang, Zeinaty, Limam, Boutaba', venue: 'CNSM', year: '2023' },
      ],
    },
  ];

  const FEATURED = { section: 'infrastructure-naming-anonymity', title: 'Astrape: Anonymous Payment Channels with Boring Cryptography', authors: 'Dong, Goldberg, Gorbunov, Boutaba', venue: 'ACNS', year: '2022' };

  SECTIONS.forEach((s, i) => { s.n = String(i + 1).padStart(2, '0'); });

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paperUrl = (p) => p.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(`"${p.title}"`)}`;
  const count = (s) => `${s.papers.length} ${s.slug === 'post-quantum-standards' ? 'entries' : 'papers'}`;
  const facultyLinks = () => FACULTY.map((f) => `<a href="${f.url}" target="_blank" rel="noreferrer">${esc(f.name)}</a>`).join('<span aria-hidden="true"> · </span>');

  /* One index row: the whole row links into the section page. */
  const indexRow = (s) => `
    <a class="rs-row reveal" href="research.html#${s.slug}">
      <div class="rs-meta">
        <span class="number">${s.n}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.def)}</p>
        <span class="rs-open">${count(s)} <b>Open section →</b></span>
      </div>
      <ol class="rs-titles">
        ${s.papers.map((p) => `<li><span>${esc(p.title)}</span><em>${esc(p.year)}</em></li>`).join('')}
      </ol>
    </a>`;

  function renderIndex(host) {
    host.innerHTML = SECTIONS.map(indexRow).join('');
  }

  function renderStats(host) {
    const papers = SECTIONS.filter((s) => s.slug !== 'post-quantum-standards').reduce((n, s) => n + s.papers.length, 0);
    host.innerHTML = `
      <div><b>${papers}</b><span>papers</span></div>
      <div><b>${SECTIONS.length}</b><span>tracks</span></div>
      <div><b>${FACULTY.length}</b><span>faculty</span></div>`;
  }

  function renderFeatured(host) {
    const f = FEATURED;
    host.innerHTML = `
      <a class="featured-paper" href="research.html#${f.section}">
        <span class="mono-label">Featured paper</span>
        <strong>${esc(f.title)}</strong>
        <span class="featured-by">${esc(f.authors)} · ${esc(f.venue)} ${esc(f.year)}</span>
        <span class="featured-why">Four Waterloo authors on one paper about anonymous payment channels.</span>
        <i aria-hidden="true">→</i>
      </a>`;
  }

  /* ---------- section page (research.html) ---------- */
  function renderSectionPage() {
    const view = document.getElementById('rpView');
    const tabs = document.getElementById('rpTabs');
    if (!view) return;

    const draw = () => {
      const slug = decodeURIComponent(location.hash.slice(1));
      const i = SECTIONS.findIndex((s) => s.slug === slug);
      tabs.innerHTML = SECTIONS.map((s) => `<a href="#${s.slug}"${s.slug === slug ? ' aria-current="page"' : ''}><span>${s.n}</span>${esc(s.title)}</a>`).join('');

      if (i < 0) {
        document.title = 'Research | Waterloo Crypto';
        view.innerHTML = `
          <header class="rp-head">
            <span class="number">04</span>
            <h1>Research</h1>
            <p class="rp-def">Curated work from University of Waterloo faculty on cryptography, privacy, blockchain, consensus and decentralized systems.</p>
            <p class="rp-faculty">${facultyLinks()}</p>
          </header>
          <div class="rs-list">${SECTIONS.map(indexRow).join('')}</div>`;
        view.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
        return;
      }

      const s = SECTIONS[i];
      const prev = SECTIONS[i - 1], next = SECTIONS[i + 1];
      document.title = `${s.title} | Waterloo Crypto Research`;
      view.innerHTML = `
        <header class="rp-head">
          <span class="number">${s.n}</span>
          <h1>${esc(s.title)}</h1>
          <p class="rp-def">${esc(s.def)}</p>
          <p class="rp-count">${count(s)}</p>
        </header>
        <div class="rp-table" role="table" aria-label="${esc(s.title)} papers">
          <div class="rp-row rp-th" role="row"><span role="columnheader">Year</span><span role="columnheader">Paper</span><span role="columnheader">Venue</span><span role="columnheader" class="sr-only">Link</span></div>
          ${s.papers.map((p) => `
            <article class="rp-row" role="row">
              <span class="year" role="cell">${esc(p.year)}</span>
              <div role="cell">
                <a class="rp-title" href="${paperUrl(p)}" target="_blank" rel="noreferrer">${esc(p.title)}</a>
                <p class="rp-authors">${esc(p.authors)}</p>
              </div>
              <div class="rp-venue" role="cell">${esc(p.venue)}${p.tag ? `<span class="rp-tag">${esc(p.tag)}</span>` : ''}</div>
              <a class="rp-link" role="cell" href="${paperUrl(p)}" target="_blank" rel="noreferrer" aria-label="Find ${esc(p.title)}">↗</a>
            </article>`).join('')}
        </div>
        <aside class="rp-note"><span>Note</span><p>${esc(s.note)}</p></aside>
        <nav class="rp-pn" aria-label="Other sections">
          ${prev ? `<a href="#${prev.slug}"><span>← ${prev.n}</span>${esc(prev.title)}</a>` : '<a href="#"><span>←</span>All research</a>'}
          ${next ? `<a class="next" href="#${next.slug}"><span>${next.n} →</span>${esc(next.title)}</a>` : '<a class="next" href="#"><span>→</span>All research</a>'}
        </nav>`;
    };

    const focusTab = () => {
      const tab = tabs.querySelector('[aria-current]');
      if (tab) tabs.scrollLeft = tab.offsetLeft - (tabs.clientWidth - tab.offsetWidth) / 2;
    };
    addEventListener('hashchange', () => { draw(); focusTab(); scrollTo({ top: 0 }); });
    draw();
    focusTab();
  }

  window.WCResearch = { renderIndex, renderStats, renderFeatured, facultyLinks };
  renderSectionPage();
})();
