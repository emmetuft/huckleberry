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
            Your profile helps AI agents understand who you are, what you're
            working on, and how you like to communicate. It only takes a few
            minutes and you can always come back to finish later.
          </p>
          <div className={styles.stepActions}>
            <Button
              type="primary"
              shape="round"
              size="large"
              onClick={() => goTo(1)}
              style={{ width: 200 }}
            >
              Let's go
            </Button>
            <Button type="text" shape="round" size="large" onClick={onSkip}>
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
