import { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import styles from './PersonaTab.module.css';
import { useAppDispatch } from 'reducers';
import { selectPersona } from 'reducers/app/slice';
import { saveUserPersona } from 'reducers/app/actions';
import { Persona } from 'models/interfaces/persona';
import { LabelInput } from 'components/shared/LabelInput/LabelInput';
import {
  applyFieldValue,
  getFieldValue,
  PersonaField,
  PersonaSection,
  SectionDef,
  sectionFields,
  sections,
  SectionStatus,
} from './personaTabConfig';

export const PersonaTab: FC = () => {
  const dispatch = useAppDispatch();
  const persona = useSelector(selectPersona);

  const [expandedSection, setExpandedSection] = useState<PersonaSection | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const completedCount = sections.filter(
    (s) => s.status(persona) === SectionStatus.Complete,
  ).length;

  const toggleSection = (key: PersonaSection) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  const save = async (updated: Persona) => {
    setSaving(true);
    await dispatch(saveUserPersona(updated));
    setSaving(false);
  };

  return (
    <div className={styles.profileHub}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Your Persona</h1>
          <p className={styles.pageSubtitle}>
            {completedCount} of {sections.length} sections complete
          </p>
        </div>
        <div className={styles.completionBadge}>
          <div
            className={styles.completionRing}
            style={
              {
                '--pct': `${Math.round((completedCount / sections.length) * 100)}`,
              } as React.CSSProperties
            }
          >
            <span className={styles.completionPct}>
              {Math.round((completedCount / sections.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        {sections.map((section) => (
          <SectionCard
            key={section.key}
            section={section}
            persona={persona}
            isExpanded={expandedSection === section.key}
            onToggle={() => toggleSection(section.key)}
            onSave={save}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
};

interface SectionCardProps {
  section: SectionDef;
  persona: Persona;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (p: Persona) => void;
  saving: boolean;
}

const SectionCard: FC<SectionCardProps> = ({
  section,
  persona,
  isExpanded,
  onToggle,
  onSave,
  saving,
}) => {
  const sectionStatus = section.status(persona);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        bodyRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 50);
    }
  }, [isExpanded]);

  return (
    <div
      className={`${styles.sectionCard} ${isExpanded ? styles.expanded : ''}`}
    >
      <button className={styles.sectionHeader} onClick={onToggle}>
        <div className={styles.sectionIcon}>{section.icon}</div>
        <div className={styles.sectionMeta}>
          <span className={styles.sectionLabel}>{section.label}</span>
          <span className={styles.sectionDesc}>{section.description}</span>
        </div>
        <div
          className={`${styles.completionPill} ${
            sectionStatus === SectionStatus.Complete
              ? styles.done
              : sectionStatus === SectionStatus.InProgress
                ? styles.inProgress
                : styles.empty
          }`}
        >
          {sectionStatus}
        </div>
      </button>

      {isExpanded && (
        <div ref={bodyRef} className={styles.sectionBody}>
          <SectionEditor
            sectionKey={section.key}
            persona={persona}
            onSave={onSave}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
};

interface SectionEditorProps {
  sectionKey: PersonaSection;
  persona: Persona;
  onSave: (p: Persona) => void;
  saving: boolean;
}

const SectionEditor: FC<SectionEditorProps> = ({
  sectionKey,
  persona,
  onSave,
  saving,
}) => {
  const [draft, setDraft] = useState<Persona>({ ...persona });

  const handleSave = () => {
    onSave({ ...draft });
  };

  const fields = sectionFields[sectionKey];
  if (fields) {
    const rows: PersonaField[][] = [];
    let i = 0;
    while (i < fields.length) {
      const f = fields[i];
      if (f.halfWidth && fields[i + 1]?.halfWidth) {
        rows.push([f, fields[i + 1]]);
        i += 2;
      } else {
        rows.push([f]);
        i++;
      }
    }
    return (
      <div className={styles.editor}>
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={row.length > 1 ? styles.editorRow : styles.editorField}
          >
            {row.map((field) => (
              <LabelInput
                key={field.key}
                inputType={field.inputType}
                label={field.label}
                placeholder={field.placeholder}
                value={getFieldValue(field.key, draft)}
                options={field.options}
                onChange={(val) =>
                  setDraft((d) => applyFieldValue(field.key, val, d))
                }
              />
            ))}
          </div>
        ))}
        <EditorActions onSave={handleSave} saving={saving} />
      </div>
    );
  }

  return null;
};

const EditorActions: FC<{ onSave: () => void; saving: boolean }> = ({
  onSave,
  saving,
}) => (
  <div className={styles.editorActions}>
    <Button type="primary" shape="round" loading={saving} onClick={onSave}>
      Save
    </Button>
  </div>
);
