import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Menu, Modal } from 'antd';
import type { MenuProps } from 'antd';
import styles from './QuickStart.module.css';
import { useAppDispatch } from 'reducers';
import {
  selectIsNewUser,
  selectOnboardingCompleted,
  selectPersona,
  setOnboardingCompleted,
} from 'reducers/app/slice';
import { saveUserPersona } from 'reducers/app/actions';
import { LabelInput } from 'components/shared/LabelInput/LabelInput';
import {
  defaultStepData,
  presetPersonas,
  QuickStartField,
  quickStartSteps,
  StepData,
  StepDataKey,
} from './quickStartConfig';
import { buildPersona } from 'utils/persona';

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

const sidebarLabels = ['Get started', ...quickStartSteps.map((s) => s.heading)];

export const QuickStart: FC = () => {
  const dispatch = useAppDispatch();
  const persona = useSelector(selectPersona);
  const isNewUser = useSelector(selectIsNewUser);
  const onboardingCompleted = useSelector(selectOnboardingCompleted);

  const [step, setStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  const [data, setData] = useState<StepData>(() => ({
    ...defaultStepData,
    role: persona?.role ?? '',
    level: persona?.level ?? '',
    department: persona?.department ?? '',
    hardSkills:
      persona?.skills.filter((s) => s.type === 'hard').map((s) => s.name) ?? [],
    softSkills:
      persona?.skills.filter((s) => s.type === 'soft').map((s) => s.name) ?? [],
    preferredFormat:
      persona?.communicationStyle?.preferredFormat ??
      defaultStepData.preferredFormat,
    tone: persona?.communicationStyle?.tone ?? defaultStepData.tone,
    decisionStyle:
      persona?.communicationStyle?.decisionStyle ??
      defaultStepData.decisionStyle,
  }));

  const goTo = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const onChange = (key: StepDataKey, value: string | string[]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const mergeAndSave = async () => {
    const mergedPersona = buildPersona(data, persona);
    await dispatch(saveUserPersona(mergedPersona));
    dispatch(setOnboardingCompleted(true));
  };

  const onSkip = () => dispatch(setOnboardingCompleted(true));

  const sidebarItems: MenuProps['items'] = sidebarLabels.map((label, i) => ({
    key: String(i),
    label,
  }));

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const targetStep = Number(key);
    goTo(targetStep);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className={styles.stepContent}>
          <h1 className={styles.stepHeading}>Tell us about you</h1>
          <p className={styles.stepSubtext}>
            Your profile helps AI agents understand who you are and how you like
            to work.
          </p>
          <button className={styles.linkedinBtn} onClick={() => {}}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Connect with LinkedIn
          </button>
          <div className={styles.orDivider}>
            <span>or pick a starting point</span>
          </div>
          <div className={styles.presetGrid}>
            {presetPersonas.map((preset) => (
              <button
                key={preset.id}
                className={styles.presetCard}
                onClick={() => {
                  setData((d) => ({ ...d, ...preset.data }));
                  goTo(1);
                }}
              >
                <span className={styles.presetTitle}>{preset.title}</span>
                <span className={styles.presetDesc}>{preset.description}</span>
              </button>
            ))}
          </div>
          <div className={styles.landingFooter}>
            <Button type="text" size="small" onClick={() => goTo(1)}>
              Start from scratch
            </Button>
            <Button type="text" size="small" onClick={onSkip}>
              Skip for now
            </Button>
          </div>
        </div>
      );
    }

    const stepConfig = quickStartSteps[step - 1];

    const fieldRows: QuickStartField[][] = [];
    let i = 0;
    while (i < stepConfig.fields.length) {
      const field = stepConfig.fields[i];
      if (field.halfWidth && stepConfig.fields[i + 1]?.halfWidth) {
        fieldRows.push([field, stepConfig.fields[i + 1]]);
        i += 2;
      } else {
        fieldRows.push([field]);
        i += 1;
      }
    }

    return (
      <div className={styles.stepContent}>
        <h1 className={styles.stepHeading}>{stepConfig.heading}</h1>
        <p className={styles.stepSubtext}>{stepConfig.subtext}</p>
        <div className={styles.fields}>
          {fieldRows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={row.length > 1 ? styles.fieldRow : undefined}
            >
              {row.map((field) => (
                <LabelInput
                  key={field.key}
                  inputType={field.inputType}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={data[field.key]}
                  options={field.options}
                  onChange={(val) => onChange(field.key, val)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={isNewUser && !onboardingCompleted}
      footer={null}
      width={840}
      centered
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Menu
            mode="inline"
            selectedKeys={[String(step)]}
            items={sidebarItems}
            onClick={handleMenuClick}
            className={styles.sidebarMenu}
          />
          {step > 0 && (
            <button className={styles.continueLater} onClick={mergeAndSave}>
              Continue later
            </button>
          )}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.animationClip}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {step > 0 && (
            <div className={styles.actionBtns}>
              {step === quickStartSteps.length ? (
                <Button type="primary" onClick={mergeAndSave}>
                  Finish
                </Button>
              ) : (
                <Button type="primary" onClick={() => goTo(step + 1)}>
                  Next
                </Button>
              )}
              {step > 0 && <Button onClick={() => goTo(step - 1)}>Back</Button>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
