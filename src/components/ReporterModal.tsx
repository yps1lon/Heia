import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {colors, typography, spacing, radius} from '../theme';
import {Button} from './Button';
import type {MatchEventType} from '../shared/types';

interface ReporterModalProps {
  visible: boolean;
  eventType: MatchEventType;
  onSubmit: (player: string, description: string) => void;
  onCancel: () => void;
}

const eventLabels: Record<MatchEventType, string> = {
  avspark: 'Avspark',
  mål: 'Mål',
  pause: 'Pause',
  andre_omgang: 'Andre omgang',
  slutt: 'Slutt',
  bytte: 'Bytte',
  kort: 'Kort',
  melding: 'Melding',
};

export function ReporterModal({
  visible,
  eventType,
  onSubmit,
  onCancel,
}: ReporterModalProps) {
  const [player, setPlayer] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onSubmit(player.trim(), description.trim());
    setPlayer('');
    setDescription('');
  };

  const needsPlayer = ['mål', 'bytte', 'kort'].includes(eventType);
  const title = eventLabels[eventType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modal}>
            <Text style={styles.title}>{title}</Text>

            {needsPlayer && (
              <View style={styles.field}>
                <Text style={styles.label}>Spiller</Text>
                <TextInput
                  style={styles.input}
                  placeholder="F.eks. Erlend H."
                  placeholderTextColor={colors.textTertiary}
                  value={player}
                  onChangeText={setPlayer}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>
                {eventType === 'melding' ? 'Melding' : 'Kort beskrivelse'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Skriv her..."
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>

            <View style={styles.buttons}>
              <Button
                title="Avbryt"
                variant="ghost"
                onPress={() => {
                  setPlayer('');
                  setDescription('');
                  onCancel();
                }}
                style={styles.button}
              />
              <Button
                title="Rapporter"
                variant="primary"
                onPress={handleSubmit}
                disabled={needsPlayer && !player.trim()}
                style={styles.button}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    gap: spacing.xl,
  },
  title: {
    ...typography.heading2,
    textAlign: 'center',
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
