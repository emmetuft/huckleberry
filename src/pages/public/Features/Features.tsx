import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import { CalendarDotsIcon } from '@phosphor-icons/react';
import styles from './Features.module.css';
import { PublicPage, publicRoutePaths } from 'models/enums/appPage';
import { Background } from 'components/layouts/PlatformLayout/Background/Background';
import { FeatureHero } from './FeatureHero/FeatureHero';
import { FeatureSection } from './FeatureSection/FeatureSection';
import { ChatDemo } from './ChatDemo/ChatDemo';
import { AgentBuilderDemo } from './AgentBuilderDemo/AgentBuilderDemo';
import { CanvasDemo } from './CanvasDemo/CanvasDemo';
import { OntologyDemo } from './OntologyDemo/OntologyDemo';
import { SecondaryFeatures } from './SecondaryFeatures/SecondaryFeatures';
import { useIsMobile } from 'hooks/useIsMobile';

export const Features: FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={styles.features}>
      <Background />
      <FeatureHero />

      <div className={styles.sections}>
        <FeatureSection
          label="AI Chat"
          title="Ask anything. Get real answers."
          description="Huckleberry reasons over your live data — not a static snapshot. Every response is grounded in the systems your team relies on, with full transparency into every step."
          bullets={[
            'Streaming responses with step-by-step tool call transparency',
            'Attach data sources, files, and toolkits to any message',
            'Session memory builds context across conversations',
          ]}
          demo={<ChatDemo />}
        />

        <FeatureSection
          label="Agent Builder"
          title="Build agents that know your business."
          description="Create purpose-built AI agents in minutes. Give them a persona, ground them in your data, equip them with tools, and share them with your team."
          bullets={[
            'Four-step wizard: persona, knowledge, tools, visibility',
            'Live preview as you build — no deploy step',
            'Fine-tune reasoning effort, memory, and planning behavior',
          ]}
          demo={<AgentBuilderDemo />}
          reversed
        />

        <FeatureSection
          label="Workspace Canvas"
          title="Connect the dots visually."
          description="An infinite canvas where data sources, metrics, goals, and people are first-class objects. Run AI analysis directly on your connected nodes."
          bullets={[
            '9 node types: data sources, metrics, goals, AI analysis, and more',
            'Typed edge relationships: Causes, Supports, Blocks, OwnedBy',
            'AI command bar to generate and analyze directly on the canvas',
          ]}
          demo={<CanvasDemo />}
        />

        <FeatureSection
          label="Business Ontology"
          title="A graph that understands your world."
          description="Define the entities and relationships that matter to your business. Huckleberry uses your ontology to give every agent deeper, more precise context."
          bullets={[
            'AI-generated ontology inferred from your data schemas',
            'Visual schema designer for custom node types and relationships',
            'Interactive 2D and 3D graph exploration',
          ]}
          demo={<OntologyDemo />}
          reversed
        />
      </div>

      <SecondaryFeatures />

      <motion.div
        className={styles.cta}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.ctaTitle}>Ready to see it in action?</h2>
        <p className={styles.ctaSubtitle}>
          Get started in minutes or book a personalized demo with our team.
        </p>
        <div className={styles.ctaBtns}>
          <Link to={`${publicRoutePaths[PublicPage.LOGIN]}?mode=signup`}>
            <Button
              type="primary"
              shape="round"
              size={isMobile ? 'small' : 'large'}
            >
              Get started for free
            </Button>
          </Link>
          <Button
            shape="round"
            size={isMobile ? 'small' : 'large'}
            icon={<CalendarDotsIcon size={20} />}
          >
            Book a demo
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
