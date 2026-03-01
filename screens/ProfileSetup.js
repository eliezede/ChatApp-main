import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../config/firebase';
import colors from '../colors';

export default function ProfileSetup({ navigation }) {
    const [name, setName] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                if (user.displayName && isMounted) setName(user.displayName);

                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && isMounted) {
                        const data = userDoc.data();
                        if (data.name) setName(data.name);
                        if (data.photoURL) setImageUri(data.photoURL);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            if (isMounted) setLoading(false);
        };
        fetchUserData();

        return () => { isMounted = false; };
    }, []);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso às tuas fotos para alterar o avatar.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
        });

        if (!result.canceled && !result.cancelled) {
            const uri = result.assets ? result.assets[0].uri : result.uri;
            setImageUri(uri);
        }
    };

    const handleContinue = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'Por favor, insere o teu nome ou apelido.');
            return;
        }

        setSaving(true);
        const user = auth.currentUser;
        if (!user) return;

        try {
            let photoURL = user.photoURL || null;

            // If a new local image was selected
            if (imageUri && !imageUri.startsWith('http')) {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const storageRef = ref(storage, `avatars/${user.uid}.jpg`);
                await uploadBytes(storageRef, blob);
                photoURL = await getDownloadURL(storageRef);
            } else if (imageUri) {
                photoURL = imageUri; // Keep existing url
            }

            // Update Firebase Auth Profile
            await updateProfile(user, {
                displayName: name.trim(),
                photoURL: photoURL
            });

            // Update Firestore Profile
            await updateDoc(doc(db, 'users', user.uid), {
                name: name.trim(),
                photoURL: photoURL
            });

            setSaving(false);
            navigation.navigate('ProtocolTutorial');

        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            setSaving(false);
            Alert.alert('Erro', 'Ocorreu um problema ao salvar o teu perfil.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* TopAppBar */}
            <View style={styles.appBar}>
                <Text style={styles.appBarTitle}>ORIGIN</Text>
            </View>

            <View style={styles.content}>
                {/* Header Text */}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>Quem és tu,{'\n'}Guerreiro?</Text>
                    <Text style={styles.subtitle}>Como queres ser chamado nesta jornada?</Text>
                </View>

                {/* Profile Uploader */}
                <View style={styles.uploaderCenter}>
                    <TouchableOpacity activeOpacity={0.8} onPress={handlePickImage} style={styles.avatarWrapper}>
                        <View style={styles.glassRing}>
                            <View style={styles.avatarInner}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                                ) : (
                                    <Image
                                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhftuXp-xKg_j0RDPPj46HWuD_XHqMYWn_U-sY9SqEoYhQBEqj2WRwYtpmk8bXvUqFfWwb3aYcz0Q56cg8kUy3gpXieya3YG0Bk9kDaIYDH5Oxp5bbPS8eZ9kdOOLR3QAWYkb5ZOkOfIm-JEjebfeeXd7n-BMRZS8Bl5xdhfDWFqV2IYA4mFKV1jcBTI56j-nG3BOzOlg_zf4RD8qvelAyhLsh4hwNoxlC92ueuW0TfBDqYtmwAbDuKUxBUmMEwtiAY616M9GQgZM' }}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
                                    />
                                )}
                            </View>
                        </View>
                        <View style={styles.editBadge}>
                            <MaterialCommunityIcons name="pencil" size={20} color={colors.backgroundDark} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Field */}
                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Nome ou Apelido</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Introduz o teu nome"
                        placeholderTextColor={colors.primary + '4d'} // primary/30
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!saving}
                    />
                </View>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, (!name.trim() || saving) && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!name.trim() || saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color={colors.backgroundDark} />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>CONTINUAR</Text>
                                <MaterialCommunityIcons name="arrow-right" size={24} color={colors.backgroundDark} style={{ fontWeight: 'bold' }} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    appBar: {
        padding: 16,
        paddingBottom: 8,
        alignItems: 'center',
    },
    appBarTitle: {
        color: '#f8f7f5', // tailwind slate-100 logic for dark mode
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    headerTextContainer: {
        paddingTop: 32,
        paddingBottom: 40,
        alignItems: 'center',
    },
    title: {
        color: '#f8f7f5',
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 40,
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        color: 'rgba(244,157,37,0.7)', // primary/70
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    uploaderCenter: {
        alignItems: 'center',
        marginBottom: 48,
    },
    avatarWrapper: {
        position: 'relative',
    },
    glassRing: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(244,157,37,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(244,157,37,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 80,
        backgroundColor: 'rgba(244,157,37,0.1)',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.backgroundDark,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    formContainer: {
        gap: 12,
    },
    inputLabel: {
        color: '#f8f7f5',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    input: {
        width: '100%',
        height: 64,
        backgroundColor: 'rgba(244,157,37,0.05)', // primary/5
        borderRadius: 24,
        paddingHorizontal: 24,
        color: '#f8f7f5',
        fontSize: 18,
        fontWeight: '500',
    },
    footer: {
        paddingTop: 24,
        paddingBottom: 40,
        marginTop: 'auto',
    },
    button: {
        width: '100%',
        height: 64,
        backgroundColor: colors.primary,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
    },
    buttonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
    },
    buttonText: {
        color: colors.backgroundDark,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    }
});
