import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Container,
  CircularProgress,
  Link
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(data);
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <Box minHeight="100vh" py={{ xs: 3, md: 5 }}>
      <Container maxWidth="md">
        <Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>COMMUNITY</Typography>
        <Typography variant="h4" gutterBottom>Members</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Connect with people in the Sharing the Message fellowship.</Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : members.length === 0 ? (
          <Typography align="center" color="textSecondary">
            No members found.
          </Typography>
        ) : (
          members.map((member) => (
            <Card key={member.id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* ✅ Use photoURL if available */}
                  <Avatar
                    sx={{ bgcolor: "#1F3F3A" }}
                    src={member.photoURL || undefined}
                  >
                    {(!member.photoURL && member.screenName?.[0]?.toUpperCase()) || "U"}
                  </Avatar>

                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {member.screenName || "Unnamed"}
                    </Typography>

                    {member.phone && (
                      <Typography variant="body2">
                        📞 <Link href={`tel:${member.phone}`} underline="hover">{member.phone}</Link>
                      </Typography>
                    )}

                    {member.cleanDate && (
                      <Typography variant="body2">
                        Clean Date: {member.cleanDate}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Container>
    </Box>
  );
};

export default MembersList;
