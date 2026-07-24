package com.sejong.catchkiller.vote;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class SuspectVote {

    @Id
    private String suspectId;

    private String name;

    private long voteCount;

    protected SuspectVote() {
    }

    public SuspectVote(String suspectId, String name, long voteCount) {
        this.suspectId = suspectId;
        this.name = name;
        this.voteCount = voteCount;
    }

    public String getSuspectId() {
        return suspectId;
    }

    public String getName() {
        return name;
    }

    public long getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(long voteCount) {
        this.voteCount = voteCount;
    }
}
